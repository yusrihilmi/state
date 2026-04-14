import { useEffect, useState } from "react";
import { useMenuStore } from "../../stores/useMenuStore";
import { useMenuCategoryStore } from "../../stores/useMenuCategoryStore";
import { toast } from "react-toastify";

export default function MenuListModal({ open, data, onClose }: any) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);


  const { createMenu, updateMenu } = useMenuStore();
  const { items: categories, fetchMenuCategories } = useMenuCategoryStore();

  useEffect(() => {
    fetchMenuCategories(1, 100);
  }, []);

  useEffect(() => {
    if (data) {
      setPreview(data.photo ? `${data.photo}` : "");
      setName(data.name || "");
      setCategoryId(data.category?.id || "");
      setDescription(data.description || "");
      setPrice(data.price ? Number(data.price) : "");
      setIsActive(data.isActive ?? true); // ⬅️ tambahin ini
      setPhotoFile(null);
    } else {
      resetForm();
    }
  }, [data, open]);


  const formatRupiah = (value: number | "") => {
    if (value === "") return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const resetForm = () => {
    setPreview("");
    setPhotoFile(null);
    setName("");
    setCategoryId("");
    setDescription("");
    setPrice("");
    setIsActive(true); // ⬅️ tambahin
  };


  if (!open) return null;

  const handleSave = async () => {
    if (!name || !categoryId || !price) {
      toast.error("Nama, kategori, dan harga wajib diisi");
      return;
    }

    // ✅ Validasi ukuran file (max 2MB)
    if (photoFile) {
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (photoFile.size > maxSize) {
        toast.error("Ukuran file maksimal 2 MB");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("categoryId", String(categoryId));
    formData.append("isActive", String(isActive));

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      if (data) {
        await updateMenu(data.id, formData);
        toast.success("Menu berhasil diupdate");
      } else {
        await createMenu(formData);
        toast.success("Menu berhasil dibuat");
      }

      onClose();
      resetForm();
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan menu");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#f2f2f2] w-[560px] rounded-lg p-6">
        <h3 className="font-semibold mb-5 text-lg">
          {data ? "Edit Menu" : "Add Menu"}
        </h3>

        <div className="space-y-4">
          {/* PHOTO + NAME */}
          <div className="grid grid-cols-[100px_1fr] gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Photo</label>
              <div className="rounded overflow-hidden bg-gray-200 h-20">
                {preview ? (
                  <img
                    src={preview}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://dummyimage.com/200x200/ddd/999")
                    }
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500">
                    No Image
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md px-3 py-2 mb-2 text-sm bg-white"
              />

              <label className="bg-primary px-2 py-1 rounded text-xs text-white cursor-pointer">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <p className="text-sm py-2 italic">*Max upload size 2mb</p>
            </div>
          </div>

          {/* CATEGORY + PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Menu Category
              </label>
              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  Rp
                </span>

                <input
                  type="text"
                  value={formatRupiah(price)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setPrice(raw ? Number(raw) : "");
                  }}
                  className="w-full rounded-md pl-9 pr-3 py-2 text-sm bg-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md px-3 py-2 text-sm bg-white resize-none"
            />
          </div>
          {/* STATUS */}
          {/* <div>
            <label className="text-sm font-medium mb-1 block">
              Status
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`px-4 py-2 rounded text-sm ${isActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`px-4 py-2 rounded text-sm ${!isActive
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                Inactive
              </button>
            </div>
          </div> */}

        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-white rounded">
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#a38f63] text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}