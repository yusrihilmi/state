import { useEffect, useState } from "react";
import TableAreaModal from "../modal/TableAreaModal";
import { useTableCategoryStore } from "../../stores/useTableCategoryStore";

export default function TableAreaTab() {
  const {
    items,
    total,
    page,
    limit,
    loading,
    fetchTableCategories,
    deleteTableCategory,
  } = useTableCategoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);


  useEffect(() => {
    fetchTableCategories(page, limit);
  }, [page, limit, fetchTableCategories]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Table Area</h2>
        <button
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm"
        >
          + Add Area
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Area Name</th>
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
                      onClick={() => {
                        setSelected(area);
                        setModalOpen(true);
                      }}
                      className="text-primary text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteId(area.id)}
                      className="text-red-500 text-sm"
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
      <h3 className="text-lg font-semibold mb-2">Delete Area</h3>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to delete this area?
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
            deleteTableCategory(deleteId);
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
            onClick={() => fetchTableCategories(page - 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => fetchTableCategories(page + 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <TableAreaModal
        open={modalOpen}
        data={selected}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}