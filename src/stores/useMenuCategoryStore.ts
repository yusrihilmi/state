import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getMenuCategoryApi,
  createMenuCategoryApi,
  updateMenuCategoryApi,
  deleteMenuCategoryApi,
} from "../api/menuCategoryApi";
import type { MenuCategory } from "../api/menuCategoryApi";

interface MenuCategoryState {
  items: MenuCategory[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;

  fetchMenuCategories: (page?: number, limit?: number) => Promise<void>;
  createMenuCategory: (payload: { name: string }) => Promise<void>;
  updateMenuCategory: (id: number, payload: { name: string }) => Promise<void>;
  deleteMenuCategory: (id: number) => Promise<void>;
}

export const useMenuCategoryStore = create<MenuCategoryState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,

  fetchMenuCategories: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });

      const res = await getMenuCategoryApi(page, limit);

      set({
        items: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load menu categories");
    } finally {
      set({ loading: false });
    }
  },

  createMenuCategory: async (payload) => {
    try {
      await createMenuCategoryApi(payload);
      toast.success("Menu created");

      const { page, limit, fetchMenuCategories } = get();
      fetchMenuCategories(page, limit);
    } catch {
      toast.error("Failed to create category");
    }
  },

  updateMenuCategory: async (id, payload) => {
    try {
      await updateMenuCategoryApi(id, payload);
      toast.success("Menu updated");

      const { page, limit, fetchMenuCategories } = get();
      fetchMenuCategories(page, limit);
    } catch {
      toast.error("Failed to update category");
    }
  },

  deleteMenuCategory: async (id) => {
    try {
      await deleteMenuCategoryApi(id);
      toast.success("Menu deleted");

      const { page, limit, fetchMenuCategories } = get();
      fetchMenuCategories(page, limit);
    } catch {
      toast.error("Failed to delete category");
    }
  },
}));