import { useEffect, useState } from "react";
import { usePromotionStore } from "../../stores/usePromotionStore";

export default function PromoModal({ open, data, onClose }: any) {
  const { createPromotion, updatePromotion } = usePromotionStore();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (data) {
      setPreview(
        data.photo
          ? `${data.photo}`
          : ""
      );
      setTitle(data.title || "");
      setFromDate(data.fromDate?.slice(0, 10) || "");
      setToDate(data.toDate?.slice(0, 10) || "");
      setDescription(data.description || "");
      setPhotoFile(null);
    } else {
      resetForm();
    }
  }, [data, open]);

  const resetForm = () => {
    setPreview("");
    setPhotoFile(null);
    setTitle("");
    setFromDate("");
    setToDate("");
    setDescription("");
  };

  if (!open) return null;

  const handleSave = async () => {
    if (!title || !fromDate || !toDate) return;

    const payload = {
      title,
      description,
      fromDate,
      toDate,
      photo: photoFile,
    };

    if (data?.id) {
      await updatePromotion(data.id, payload);
    } else {
      await createPromotion(payload);
    }

    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#f2f2f2] w-[560px] rounded-lg p-6">
        <h3 className="font-semibold mb-5 text-lg">
          {data ? "Edit Promo" : "Add Promo"}
        </h3>

        <div className="space-y-4">
          {/* PHOTO + TITLE */}
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
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
            </div>
          </div>

          {/* DATE RANGE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm bg-white"
              />
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