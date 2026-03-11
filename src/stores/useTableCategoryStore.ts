import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getTableCategoryApi,
  createTableCategoryApi,
  updateTableCategoryApi,
  deleteTableCategoryApi,
} from "../api/tableCategoryApi";
import type { TableCategory } from "../api/tableCategoryApi";

interface TableCategoryState {
  items: TableCategory[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;

  fetchTableCategories: (page?: number, limit?: number) => Promise<void>;
  createTableCategory: (payload: { name: string }) => Promise<void>;
  updateTableCategory: (id: number, payload: { name: string }) => Promise<void>;
  deleteTableCategory: (id: number) => Promise<void>;
}

export const useTableCategoryStore = create<TableCategoryState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,

  fetchTableCategories: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });

      const res = await getTableCategoryApi(page, limit);

      set({
        items: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load table categories");
    } finally {
      set({ loading: false });
    }
  },

  createTableCategory: async (payload) => {
    try {
      await createTableCategoryApi(payload);
      toast.success("Area created");

      const { page, limit, fetchTableCategories } = get();
      fetchTableCategories(page, limit);
    } catch {
      toast.error("Failed to create area");
    }
  },

  updateTableCategory: async (id, payload) => {
    try {
      await updateTableCategoryApi(id, payload);
      toast.success("Area updated");

      const { page, limit, fetchTableCategories } = get();
      fetchTableCategories(page, limit);
    } catch {
      toast.error("Failed to update area");
    }
  },

  deleteTableCategory: async (id) => {
    try {
      await deleteTableCategoryApi(id);
      toast.success("Area deleted");

      const { page, limit, fetchTableCategories } = get();
      fetchTableCategories(page, limit);
    } catch {
      toast.error("Failed to delete area");
    }
  },
}));