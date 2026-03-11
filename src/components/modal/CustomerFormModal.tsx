import { useEffect, useState } from "react";
import { useCustomerStore } from "../../stores/useCustomerStore";

export default function CustomerFormModal({
    open,
    onClose,
    data,
}: {
    open: boolean;
    onClose: () => void;
    data?: any;
}) {
    const { createCustomer, updateCustomer } = useCustomerStore();

    const [form, setForm] = useState({
        fullname: "",
        phone: "",
        email: "",
        instagram: "",
    });

    useEffect(() => {
        if (data) {
            setForm({
                fullname: data.fullname,
                phone: data.phone,
                email: data.email,
                instagram: data.instagram,
            });
        } else {
            setForm({
                fullname: "",
                phone: "",
                email: "",
                instagram: "",
            });
        }
    }, [data]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (data?.id) {
            await updateCustomer(data.id, form);
        } else {
            await createCustomer(form);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                    {data ? "Edit Customer" : "Add Customer"}
                </h2>

                <div className="flex flex-col gap-3">

                    <label className="text-sm text-gray-600 block ">
                        Full Name
                    </label>
                    <input
                        placeholder="Full Name"
                        value={form.fullname}
                        onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                        className="p-3 border rounded"
                    />
                    <label className="text-sm text-gray-600 block ">
                        Phone
                    </label>
                    <input
                        type="number"
                        min={0}
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="p-3 border rounded"
                    />

                    <label className="text-sm text-gray-600 block ">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="p-3 border rounded"
                    />

                    <label className="text-sm text-gray-600 block ">
                        Instagram
                    </label>
                    <input
                        placeholder="Instagram"
                        value={form.instagram}
                        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                        className="p-3 border rounded"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button className="px-4 py-2 border rounded" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-primary text-white rounded"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}