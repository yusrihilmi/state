import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useCloseOutStore } from "../../stores/useCloseOutStore";
import { useTableCategoryStore } from "../../stores/useTableCategoryStore";

interface Props {
    open: boolean;
    data?: any;
    onClose: () => void;
}

export default function CloseOutModal({ open, data, onClose }: Props) {
    const {
        closeOutTables,
        fetchCloseOuts,
        createCloseOut,
        updateCloseOut,
        deleteCloseOut,
        loading: listLoading,
    } = useCloseOutStore();

    const [editingId, setEditingId] = useState<number | null>(null);

    const {
        items: categories,
        fetchTableCategories,
    } = useTableCategoryStore();

    const generateTimeOptions = () => {
        const times: string[] = [];

        try {
            const layoutStr = localStorage.getItem("layout");
            if (!layoutStr) return times;

            const layout = JSON.parse(layoutStr);
            const openHours = layout.openHours || "00:00";
            const closedHours = layout.closedHours || "23:45";

            const parseTime = (timeStr: string) => {
                const [hours, minutes] = timeStr.split(":").map(Number);
                return hours * 60 + minutes;
            };

            const startMinutes = parseTime(openHours);
            const endMinutes = parseTime(closedHours);

            for (let mins = startMinutes; mins <= endMinutes; mins += 15) {
                const hour = Math.floor(mins / 60);
                const minute = mins % 60;

                times.push(
                    `${hour.toString().padStart(2, "0")}:${minute
                        .toString()
                        .padStart(2, "0")}`
                );
            }
        } catch (err) {
            console.error("Failed to generate time options:", err);
        }

        return times;
    };

    const timeOptions = generateTimeOptions();

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        categoryIds: [] as number[],
        branchId: 1,
        fromDate: "",
        toDate: "",
        fromTime: "",
        untilTime: "",
    });
    const [page, setPage] = useState(1);
    const limit = 3; // misalnya 5 per page

    useEffect(() => {
        if (!open) return;

        fetchCloseOuts(page, limit);
    }, [open, page]);

    useEffect(() => {
        if (open) {
            fetchTableCategories(1, 100);
        }
    }, [open]);

    /* ================= INIT MODE ================= */
    useEffect(() => {
        if (!open) return;
        if (!data) return;
        if (!categories.length) return; // ⬅️ tunggu categories ada

        setForm({
            title: data.title ?? "",
            categoryIds: data.categories?.map((c: any) => c.id) ?? [],
            branchId: data.branch?.id ?? 1,
            fromDate: data.fromDate ?? "",
            toDate: data.toDate ?? "",
            fromTime: data.fromTime ?? "",
            untilTime: data.untilTime ?? "",
        });
    }, [open, data, categories]);

    useEffect(() => {
        if (!open) return;
        if (data) return;

        setForm({
            title: "",
            categoryIds: [],
            branchId: 1,
            fromDate: "",
            toDate: "",
            fromTime: "",
            untilTime: "",
        });
    }, [open, data]);



    if (!open) return null;

    const handleEdit = (row: any) => {
        setEditingId(row.id);

        setForm({
            title: row.title,
            categoryIds: row.categories?.map((c: any) => c.id) ?? [], // karena API cuma 1 category
            branchId: row.branch?.id ?? 1,
            fromDate: row.fromDate,
            toDate: row.toDate,
            fromTime: row.fromTime,
            untilTime: row.untilTime,
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ================= SAVE ================= */
    const handleSave = async () => {
        try {
            if (!form.title) {
                toast.error("Title is required");
                return;
            }

            if (!form.categoryIds.length) {
                toast.error("Please select at least one area");
                return;
            }

            setLoading(true);

            const payload = {
                title: form.title,
                categoryIds: form.categoryIds,
                branchId: form.branchId,
                fromDate: form.fromDate,
                toDate: form.toDate,
                fromTime: form.fromTime,
                untilTime: form.untilTime,
            };

            if (editingId) {
                await updateCloseOut(editingId, payload);
                toast.success("Close out updated");
            } else {
                await createCloseOut(payload);
                toast.success("Close out created");
            }

            // onClose();
        } catch (err) {
            toast.error("Failed to save close out");
            console.error(err);
        } finally {
            setLoading(false);
            setEditingId(null);
            setForm({
                title: "",
                categoryIds: [],
                branchId: 1,
                fromDate: "",
                toDate: "",
                fromTime: "",
                untilTime: "",
            });
        }
    };

    const handleDeleteRow = async (id: number) => {
  const confirmed = window.confirm("Are you sure you want to delete this close out?");
  if (!confirmed) return;

  try {
    await deleteCloseOut(id);
    toast.success("Close out deleted");
  } catch (err) {
    toast.error("Failed to delete close out");
    console.error(err);
  }
};

    const handleDelete = async () => {
        if (!data?.id) return;

        if (!confirm("Delete this close out?")) return;

        await deleteCloseOut(data.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[700px] rounded-xl p-6">

                <h2 className="text-lg font-semibold mb-6">
                    {data ? "Edit Close Out" : "Create Close Out"}
                </h2>

                <div className="grid grid-cols-2 gap-4">

                    <div className="flex flex-col">
                        <label>Title</label>
                        <input
                            className="input"
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex flex-col">
                        <label>Area</label>
                        <Select
                            isMulti
                            options={categoryOptions}
                            value={categoryOptions.filter(opt =>
                                form.categoryIds.includes(opt.value)
                            )}
                            onChange={(selected) => {
                                const ids = selected
                                    ? selected.map((s) => Number(s.value))
                                    : [];

                                setForm({
                                    ...form,
                                    categoryIds: ids,
                                });
                            }}
                            placeholder="Select area..."
                            isLoading={!categories.length}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label>From Date</label>
                        <input
                            type="date"
                            className="input"
                            value={form.fromDate}
                            onChange={(e) =>
                                setForm({ ...form, fromDate: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex flex-col">
                        <label>To Date</label>
                        <input
                            type="date"
                            className="input"
                            value={form.toDate}
                            onChange={(e) =>
                                setForm({ ...form, toDate: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex flex-col">
                        <label>From Time</label>
                        <select
                            className="input"
                            value={form.fromTime}
                            onChange={(e) =>
                                setForm({ ...form, fromTime: e.target.value })
                            }
                        >
                            <option value="">Select time</option>
                            {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label>Until Time</label>
                        <select
                            className="input"
                            value={form.untilTime}
                            onChange={(e) =>
                                setForm({ ...form, untilTime: e.target.value })
                            }
                        >
                            <option value="">Select time</option>
                            {timeOptions.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TABLE SELECT */}
                </div>

                {/* BUTTONS */}
                <div className="flex justify-between mt-8">

                    <div>
                        {data && (
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Close
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-primary"
                                }`}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>

                {/* ================= CLOSE OUT TABLE ================= */}
                <div className="mt-8">
                    <h3 className="font-semibold mb-3">Close Out List</h3>

                    {listLoading ? (
                        <p className="text-sm text-gray-400">Loading...</p>
                    ) : closeOutTables.length === 0 ? (
                        <p className="text-sm text-gray-400">No data</p>
                    ) : (
                        <table className="w-full text-sm border rounded">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Title</th>
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border">Time</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closeOutTables.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={editingId === row.id ? "bg-yellow-50" : ""}
                                    >
                                        <td className="p-2 border">{row.title}</td>
                                        <td className="p-2 border">
                                            {row.fromDate} - {row.toDate}
                                        </td>
                                        <td className="p-2 border">
                                            {row.fromTime} - {row.untilTime}
                                        </td>
                                        <td className="p-2 border text-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(row)}
                                                className="px-2 py-1 text-xs bg-primary text-white rounded"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDeleteRow(row.id)}
                                                className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <div className="flex justify-end mt-4 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((prev) => prev - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Prev
                        </button>

                        <span className="px-3 py-1 text-sm">
                            Page {page}
                        </span>

                        <button
                            disabled={closeOutTables.length < limit}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <style>{`
          .input {
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
        `}</style>
            </div>
        </div>
    );
}