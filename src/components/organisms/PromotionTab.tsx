import { useEffect, useState } from "react";
import PromoModal from "../modal/PromoModal";
import { usePromotionStore } from "../../stores/usePromotionStore";

export default function PromotionTab() {
  const {
    items,
    total,
    page,
    limit,
    loading,
    fetchPromotions,
    deletePromotion,
  } = usePromotionStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [role, setRole] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const userRole = parsed?.state?.user?.role;

      setRole(userRole);
    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);


  useEffect(() => {
    fetchPromotions(page, limit);
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);


  const DUMMY_IMAGE = "https://dummyimage.com/320x240/ccc/fff&text=No+Image";

  const allowedRoles = [1, 2, 6];
  const canSave = role !== null && allowedRoles.includes(role);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-end mb-4">


        {canSave && (
          <button
            onClick={() => {
              setSelected(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            + Add Promo
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 w-36">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>


              {canSave && (


                <th className="p-3 text-right">Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No promotions
                </td>
              </tr>
            )}

            {!loading &&
              items.map((item) => (
                <tr key={item.id} className="border-t align-top">
                  <td className="p-3">
                    <img
                      src={
                        item.photo
                          ? `${item.photo}`
                          : "/no-image.png"
                      }
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = DUMMY_IMAGE)
                      }
                      alt={item.title}
                      className="rounded-md border"
                    />
                  </td>

                  <td className="p-3 font-medium">{item.title}</td>

                  <td className="p-3 max-w-xs">
                    <p className="line-clamp-2 text-gray-600">
                      {item.description}
                    </p>
                  </td>

                  <td className="p-3">
                    {new Date(item.fromDate).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    {new Date(item.toDate).toLocaleDateString()}
                  </td>

                  {canSave && (

                    <td className="p-3 space-x-2 text-right">
                      <button
                        onClick={() => {
                          setSelected(item);
                          setModalOpen(true);
                        }}
                        className="text-primary text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Promotion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this promotion?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deletePromotion(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {/* PAGINATION */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-500">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => fetchPromotions(page - 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => fetchPromotions(page + 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <PromoModal
        open={modalOpen}
        data={selected}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}