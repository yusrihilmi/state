import { useState, useEffect } from "react";
import { useMenuCategoryStore } from "../../stores/useMenuCategoryStore";

export default function MenuCategoryModal({ open, data, onClose }: any) {
  const [name, setName] = useState("");

  const {
    createMenuCategory,
    updateMenuCategory,
  } = useMenuCategoryStore();

  useEffect(() => {
    if (data) {
      setName(data.name);
    } else {
      setName("");
    }
  }, [data]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) return;

    if (data) {
      await updateMenuCategory(data.id, { name });
    } else {
      await createMenuCategory({ name });
    }

    setName(""); // 🔥 reset
    onClose();
  };

  const handleClose = () => {
    setName(""); // 🔥 reset
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-lg p-5">
        <h3 className="font-semibold mb-4">
          {data ? "Edit Category" : "Add Category"}
        </h3>

        <label className="text-sm text-gray-600 block mb-1">
          Category Name
        </label>
        <input
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={handleClose} className="px-4 py-2 text-sm">
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