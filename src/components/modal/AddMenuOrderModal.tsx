import { useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { useReservationStore } from "../../stores/useReservationStore";

export default function AddMenuOrderModal({
  open,
  onClose,
  onSave,
  initialSelected = [],
}: any) {
  const {
  menuCategories: categories,
  menus,
  menuPage,
  menuTotal,
  menuLimit,
  fetchMenuCategories,
  fetchMenus,
} = useReservationStore();


  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [selected, setSelected] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);


  /* ================= FETCH DATA ================= */
  
  useEffect(() => {
  if (open) {
    fetchMenuCategories();
  }
}, [open]);

useEffect(() => {
  if (activeCategoryId) {
    fetchMenus(activeCategoryId, 1, 10);
  }
}, [activeCategoryId]);


  

useEffect(() => {
  if (open) {
    setSelected(initialSelected || []);
  }
}, [open, initialSelected]);

  /* ================= SET DEFAULT CATEGORY ================= */
  useEffect(() => {
    if (categories.length && activeCategoryId === null) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories]);

  if (!open) return null;

  /* ================= HANDLERS ================= */
  const toggleMenu = (menu: any) => {
    const exist = selected.find((m) => m.id === menu.id);
    if (exist) {
      setSelected(selected.filter((m) => m.id !== menu.id));
    } else {
      setSelected([...selected, { ...menu, qty: 1 }]);
    }
  };

  const changeQty = (id: number, delta: number) => {
    setSelected((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, qty: Math.max(1, m.qty + delta) } : m
      )
    );
  };

  /* ================= FILTER MENU BY CATEGORY ================= */
  const filteredMenu = menus.filter(
    (m) => m.category?.id === activeCategoryId
  );

  const DUMMY_IMAGE =
  "https://dummyimage.com/320x240/ccc/fff&text=No+Image";

const handleScroll = async (e: any) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

  const isNearBottom =
    scrollHeight - scrollTop <= clientHeight + 20; // kasih toleransi 20px

  const totalPage = Math.ceil(menuTotal / menuLimit);

  if (
    isNearBottom &&
    !loadingMore &&
    activeCategoryId &&
    menuPage < totalPage
  ) {
    setLoadingMore(true);

    await fetchMenus(activeCategoryId, menuPage + 1, 10);

    setLoadingMore(false);
  }
};

const formatRupiah = (value: string | number) => {
  const number = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};


  

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-[#e5e5e5] w-[24rem] md:w-[24rem] mx-4 rounded-xl p-6 flex flex-col">

        <h3 className="font-semibold text-lg text-black mb-4">Menu</h3>

        {/* ================= CATEGORY ================= */}
        <div className="flex gap-2 mb-4 overflow-x-auto max-w-md md:max-w-[900px] whitespace-nowrap scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryId(c.id)}
              className={`px-4 py-1 rounded-full border text-sm shrink-0
        ${activeCategoryId === c.id
                  ? "bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-primary)] text-[var(--color-primary)]"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>


        {/* ================= MENU GRID ================= */}
        <div  
  onScroll={handleScroll} className="grid grid-cols-1 md:grid-cols-1 gap-4 flex-1 overflow-y-auto max-h-[450px] pr-4">
          {filteredMenu.map((menu) => {
            const selectedItem = selected.find((m) => m.id === menu.id);

            return (
              <div
                key={menu.id}
                className="bg-[var(--color-primary)] rounded-xl p-3 text-white"
              >
                <img
                  src={
                    menu.photo
                      ? `${menu.photo}`
                      : DUMMY_IMAGE
                  }
                  onError={(e) => {
                    e.currentTarget.src = DUMMY_IMAGE;
                  }}
                  className="md:h-40 h-52 w-full object-cover rounded-md mb-2"
                />

                <p className="font-medium mb-2">{menu.name}</p>
                <p className="font-medium mb-2">{formatRupiah(menu.price)}</p>

                {selectedItem ? (
                  <div className="flex items-center justify-between bg-white text-black rounded-md px-2 py-1">
                    <button
                      className="text-red-500 flex items-center gap-1 p-0"
                      onClick={() => toggleMenu(menu)}
                    >
                      <Trash2Icon className="h-4" />
                      Cancel
                    </button>

                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQty(menu.id, -1)}>-</button>
                      <span>{selectedItem.qty}</span>
                      <button onClick={() => changeQty(menu.id, 1)}>+</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleMenu(menu)}
                    className="w-full bg-white text-black rounded-md py-1"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}

          {!filteredMenu.length && (
            <p className="col-span-4 text-center text-gray-500">
              No menu in this category
            </p>
          )}
        </div>

        {/* ================= ACTION ================= */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(selected);
              onClose();
            }}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}