import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNewsTodayStore } from "../../stores/useNewsTodayStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewsTodayModal({ open, onClose }: Props) {
  const {
    newsToday,
    fetchNewsToday,
    createNewsToday,
    updateNewsToday,
  } = useNewsTodayStore();

  const [form, setForm] = useState({
    newsToday: "",
  });

  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!open) return;
    fetchNewsToday();
  }, [open]);

  /* ================= INIT FORM ================= */
  useEffect(() => {
    if (!open) return;

    if (newsToday) {
      setForm({
        newsToday: newsToday.newsToday,
      });
    } else {
      setForm({
        newsToday: "",
      });
    }
  }, [open, newsToday]);

  if (!open) return null;

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.newsToday.trim()) {
      toast.error("News Today cannot be empty");
      return;
    }

    try {
      setSaving(true);

      if (newsToday?.id) {
        await updateNewsToday(newsToday.id, {
          newsToday: form.newsToday,
        });
        toast.success("News updated");
      } else {
        await createNewsToday({
          newsToday: form.newsToday,
        });
        toast.success("News created");
      }

      onClose();
    } catch (err) {
      toast.error("Failed to save news");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-xl p-6">

        <h2 className="text-lg font-semibold mb-6">
          News Today
        </h2>

        <div className="flex flex-col gap-4">
          <label className="font-medium">News Content</label>

          <textarea
            rows={6}
            className="input"
            value={form.newsToday}
            onChange={(e) =>
              setForm({ newsToday: e.target.value })
            }
            placeholder="Enter today's news..."
          />
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