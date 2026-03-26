import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSpecialRequestStore } from "../../stores/useSpecialRequestStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SpecialRequestModal({ open, onClose }: Props) {
  const {
    specialRequests,
    fetchSpecialRequests,
    updateSpecialRequest,
  } = useSpecialRequestStore();

  const [form, setForm] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!open) return;
    fetchSpecialRequests();
  }, [open]);

  /* ================= INIT FORM ================= */
  useEffect(() => {
    if (!open) return;

    if (specialRequests?.length) {
      setForm(specialRequests);
    } else {
      setForm([]);
    }
  }, [open, specialRequests]);

  if (!open) return null;

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (index: number, value: string) => {
    const updated = [...form];
    updated[index].title = value;
    setForm(updated);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      for (const item of form) {
        if (!item.title.trim()) {
          toast.error("Title cannot be empty");
          return;
        }

        await updateSpecialRequest(item.id, {
          title: item.title,
        });
      }

      toast.success("Special Request updated");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-xl p-6 max-h-[80vh] overflow-auto">

        <h2 className="text-lg font-semibold mb-6">
          Special Request
        </h2>

        <div className="flex flex-col gap-4">
          {form.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Request #{index + 1}
              </label>

              <input
                type="text"
                className="input"
                value={item.title}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="Enter request..."
              />
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end mt-8 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Close
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-white rounded ${
              saving ? "bg-gray-400" : "bg-primary"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <style>{`
          .input {
            background: white;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
        `}</style>

      </div>
    </div>
  );
}