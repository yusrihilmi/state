import { useEffect, useState } from "react";
import MenuListModal from "../modal/MenuListModal";
import { useMenuStore } from "../../stores/useMenuStore";
import { useMenuCategoryStore } from "../../stores/useMenuCategoryStore";


const PAGE_SIZE = 10;
const DUMMY_IMAGE = "https://dummyimage.com/320x240/ccc/fff&text=No+Image";

export default function MenuListTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const { items: categories, fetchMenuCategories } = useMenuCategoryStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);




  const {
    items,
    total,
    page,
    limit,
    loading,

    searchName,
    setSearchName,
    fetchMenus,
    deleteMenu,
    setCategoryFilter,
    updateMenuStatus
  } = useMenuStore();


  useEffect(() => {
    setCategoryFilter(""); // ✅ reset filter
    fetchMenus(1, PAGE_SIZE);
    fetchMenuCategories(1, 100);
  }, []);



  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Menu List</h2>
        <div className="flex gap-4">

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                fetchMenus(1, limit); // reset ke page 1
              }}
              className="w-full rounded-md px-3 py-2 text-sm bg-white border-primary border-2"
            />
          </div>


          <div className="flex gap-3 mb-4">
            <select
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : "";
                setCategoryFilter(value);
                fetchMenus(1, limit);
              }}
              className="w-full rounded-md px-3 py-[.60rem] text-sm border-primary border-2"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setSelected(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            + Add Menu
          </button>

        </div>
        {/* FILTER */}

      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 w-36">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Description</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && items.map((menu) => (
              <tr key={menu.id} className="border-t align-top">
                {/* IMAGE */}
                <td className="p-3">
                  <img
                    src={
                      menu.photo
                        ? `${menu.photo}`
                        : DUMMY_IMAGE
                    }
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = DUMMY_IMAGE)
                    }
                    className="rounded-md object-cover border w-full h-24"
                  />
                </td>

                {/* NAME */}
                <td className="p-3 font-medium">{menu.name}</td>

                {/* CATEGORY */}
                <td className="p-3">
                  <span className="px-2 py-1 rounded text-xs bg-gray-100">
                    {menu.category?.name}
                  </span>
                </td>

                {/* DESCRIPTION */}
                <td className="p-3 max-w-xs">
                  <p className="text-gray-600 line-clamp-2">
                    {menu.description}
                  </p>
                </td>

                {/* PRICE */}
                <td className="p-3 font-semibold">
                  Rp {Number(menu.price).toLocaleString("id-ID")}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!menu.status}
                      onChange={() =>
                        updateMenuStatus(menu.id, !menu.status)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer 
      peer-checked:bg-green-500 
      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
      after:bg-white after:border after:rounded-full after:h-5 after:w-5 
      after:transition-all 
      peer-checked:after:translate-x-full 
      relative">
                    </div>
                  </label>
                </td>



                {/* ACTION */}
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setSelected(menu);
                      setModalOpen(true);
                    }}
                    className="text-primary text-sm font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(menu.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Menu</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "
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
                  deleteMenu(deleteId);
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
            onClick={() => fetchMenus(page - 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => fetchMenus(page + 1, limit)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <MenuListModal
        open={modalOpen}
        data={selected}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}