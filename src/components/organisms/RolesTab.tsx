import { useEffect, useState } from "react";
import RolesModal from "../modal/RolesModal";
import { useAclManagementStore } from "../../stores/useAclManagementStore";

export default function RolesTab() {
  const {
    items,
    total,
    page,
    limit,
    fetchRoles,
    fetchRolesDefault,
    deleteRole,
    loading,
  } = useAclManagementStore();

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
          item.menu_id === 13 &&
          item.no_access === false &&
          item.view_edit === true
      );

      setCanSave(hasPermission);
    } catch (err) {
      console.error("Failed to parse auth-storage", err);
    }
  }, []);


  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchRoles(page, limit);
    fetchRolesDefault
  }, [page, limit]);




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
            + Add Role
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Role Name</th>
              <th className="p-3">Default Role</th>
              {canSave && <th className="p-3 w-40">Action</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No data
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t">
                  {/* ROLE NAME */}
                  <td className="p-3">{item.name}</td>

                  {/* DEFAULT ROLE */}
                  <td className="p-3">
                    {item.roleDefault?.name || "-"}
                  </td>

                  {/* ACTION */}
                  {canSave && (
                    <td className="p-3 flex gap-3">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Role</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete role "
              {items.find(i => i.id === deleteId)?.name}"?
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
                  deleteRole(deleteId);
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
            onClick={() => fetchRoles(page - 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => fetchRoles(page + 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <RolesModal
        open={modalOpen}
        data={selected}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}