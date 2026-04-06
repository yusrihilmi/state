import { useEffect, useState } from "react";
import MenuCategoryModal from "../modal/MenuCategoryModal";
import { useMenuCategoryStore } from "../../stores/useMenuCategoryStore";

export default function MenuCategoryTab() {
  const {
    items,
    total,
    page,
    limit,
    loading,
    fetchMenuCategories,
    deleteMenuCategory,
  } = useMenuCategoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [canSave, setCanSave] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth-storage");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const access = parsed?.state?.user?.access || [];

      const hasPermission = access.some(
        (item: any) =>
          item.menu_id === 8 &&
          item.no_access === false &&
          item.view_edit === true
      );

      setCanSave(hasPermission);

    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);


  useEffect(() => {
    fetchMenuCategories(page, limit);
  }, [page, limit, fetchMenuCategories]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Menu Category</h2>
        <button
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return;
            setSelected(null);
            setModalOpen(true);
          }}
          className={`px-4 py-2 rounded-md text-sm ${canSave
            ? "bg-primary text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          + Add Category
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Category Name</th>
              <th className="p-3 w-40">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-400">
                  No data
                </td>
              </tr>
            ) : (
              items.map((area) => (
                <tr key={area.id} className="border-t">
                  <td className="p-3">{area.name}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      disabled={!canSave}
                      onClick={() => {
                        if (!canSave) return;
                        setSelected(area);
                        setModalOpen(true);
                      }}
                      className={`text-sm ${canSave ? "text-primary" : "text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      Edit
                    </button>

                    <button
                      disabled={!canSave}
                      onClick={() => {
                        if (!canSave) return;
                        setDeleteId(area.id);
                      }}
                      className={`text-sm ${canSave ? "text-red-500" : "text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this category?
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
                  deleteMenuCategory(deleteId);
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
          Page {page} of {totalPages || 1}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => fetchMenuCategories(page - 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => fetchMenuCategories(page + 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <MenuCategoryModal
        open={modalOpen}
        data={selected}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}