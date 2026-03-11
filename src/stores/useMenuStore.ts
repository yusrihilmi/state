// src/stores/useMenuStore.ts
import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getMenuApi,
  createMenuApi,
  updateMenuApi,
  deleteMenuApi,
  updateMenuStatusApi
} from "../api/menuApi";
import type { MenuItem } from "../api/menuApi";

interface MenuState {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  categoryId?: number | "";
  searchName?: string | "";
  statusLoadingIds: number[];

  fetchMenus: (page?: number, limit?: number) => Promise<void>;
  setCategoryFilter: (categoryId: number | "") => void; // ✅ TAMBAH INI

  createMenu: (formData: FormData) => Promise<void>;
  updateMenu: (id: number, formData: FormData) => Promise<void>;
  deleteMenu: (id: number) => Promise<void>;
  updateMenuStatus: (id: number, status: boolean) => Promise<void>;
  setSearchName: (search: string) => void;

}


export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  categoryId: "",
  searchName: "",
  statusLoadingIds: [],

  setCategoryFilter: (categoryId: number | "") => {
    set({ categoryId });
  },

  setSearchName: (search) => {
  set({ searchName: search });
},

  


  /* ================= GET ================= */
  fetchMenus: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });

      const { categoryId, searchName } = get();

      const res = await getMenuApi(page, limit, categoryId, searchName); // ⬅️ kirim category

      set({
        items: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load menu");
    } finally {
      set({ loading: false });
    }
  },

  /* ================= UPDATE STATUS ================= */
updateMenuStatus: async (id, status) => {
  const { items } = get();

  // ✅ Optimistic update (langsung ubah UI)
  set({
    items: items.map((item) =>
      item.id === id ? { ...item, status } : item
    ),
    statusLoadingIds: [...get().statusLoadingIds, id],
  });

  try {
    await updateMenuStatusApi(id, status);

    toast.success("Status updated");
  } catch (err: any) {
    // ❌ rollback kalau gagal
    set({
      items: items,
    });

    toast.error(err?.message || "Failed to update status");
  } finally {
    set({
      statusLoadingIds: get().statusLoadingIds.filter(
        (loadingId) => loadingId !== id
      ),
    });
  }
},



  /* ================= CREATE ================= */
  createMenu: async (formData) => {
    try {
      await createMenuApi(formData);
      toast.success("Menu created");

      const { page, limit, fetchMenus } = get();
      fetchMenus(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create menu");
    }
  },

  /* ================= UPDATE ================= */
  updateMenu: async (id, formData) => {
    try {
      await updateMenuApi(id, formData);
      toast.success("Menu updated");

      const { page, limit, fetchMenus } = get();
      fetchMenus(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update menu");
    }
  },

  /* ================= DELETE ================= */
  deleteMenu: async (id) => {
    try {
      await deleteMenuApi(id);
      toast.success("Menu deleted");

      const { page, limit, fetchMenus } = get();
      fetchMenus(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete menu");
    }
  },
}));