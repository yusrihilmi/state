import { useEffect, useState } from "react";
import { useTableNumberStore } from "../../stores/useTableNumberStore";
import { useTableCategoryStore } from "../../stores/useTableCategoryStore";

export default function TableNumberModal({ open, data, onClose }: any) {
  const [number, setNumber] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [covers, setCovers] = useState<number | "">("");

  const { createTableNumber, updateTableNumber } = useTableNumberStore();
  const { items: categories, fetchTableCategories } =
    useTableCategoryStore();

  useEffect(() => {
    if (open) {
      fetchTableCategories(1, 100); // ambil semua kategori
    }
  }, [open, fetchTableCategories]);

  useEffect(() => {
    if (data) {
      setNumber(data.number);
      setCategoryId(data.category.id);
      setCovers(data.covers);
    } else {
      setNumber("");
      setCategoryId("");
      setCovers("");
    }
  }, [data, open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!number.trim() || !categoryId) return;

    const payload = {
      number,
      categoryId: Number(categoryId),
      covers: Number(covers),
    };

    if (data) {
      await updateTableNumber(data.id, payload);
    } else {
      await createTableNumber(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-lg p-5">
        <h3 className="font-semibold mb-4">
          {data ? "Edit Table Number" : "Add Table Number"}
        </h3>

        <div className="space-y-4">
          {/* TABLE NUMBER */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Table Number
            </label>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g I1 / O2"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Covers Seat
            </label>
            <input
              value={covers}
              type="number"
              onChange={(e) => setCovers(Number(e.target.value))}
              placeholder="1"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}