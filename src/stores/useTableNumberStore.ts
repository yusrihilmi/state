import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getTableNumberApi,
  createTableNumberApi,
  updateTableNumberApi,
  deleteTableNumberApi,
  getAvailableTableCategoriesApi,
  getAvailableTablesApi,
} from "../api/tableNumberApi";
import type {
  TableNumberDetail,
  AvailableCategory,
  AvailableTable,
} from "../api/tableNumberApi";

type TableNumberPayload = {
  number: string;
  categoryId: number;
  covers: number;
};

interface TableNumberState {
  items: TableNumberDetail[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  availableCategories: AvailableCategory[];
  availableTables: AvailableTable[];
  bookingLoading: boolean;

  fetchTableNumbers: (page?: number, limit?: number) => Promise<void>;
  createTableNumber: (payload: TableNumberPayload) => Promise<void>;
  updateTableNumber: (
    id: number,
    payload: TableNumberPayload
  ) => Promise<void>;
  deleteTableNumber: (id: number) => Promise<void>;
  fetchAvailableCategories: (date: string, time: string) => Promise<void>;
  fetchAvailableTables: (
    date: string,
    time: string,
    categoryId: number,
    bookingId?: number
  ) => Promise<void>;
}

export const useTableNumberStore = create<TableNumberState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  availableCategories: [],
  availableTables: [],
  bookingLoading: false,

  fetchTableNumbers: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });

      const res = await getTableNumberApi(page, limit);

      set({
        items: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load table numbers");
    } finally {
      set({ loading: false });
    }
  },

  createTableNumber: async (payload) => {
    try {
      await createTableNumberApi(payload);
      toast.success("Table number created");

      const { page, limit, fetchTableNumbers } = get();
      fetchTableNumbers(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create table number");
    }
  },

  updateTableNumber: async (id, payload) => {
    try {
      await updateTableNumberApi(id, payload);
      toast.success("Table number updated");

      const { page, limit, fetchTableNumbers } = get();
      fetchTableNumbers(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update table number");
    }
  },

  deleteTableNumber: async (id) => {
    try {
      await deleteTableNumberApi(id);
      toast.success("Table number deleted");

      const { page, limit, fetchTableNumbers } = get();
      fetchTableNumbers(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete table number");
    }
  },
  fetchAvailableCategories: async (date, time) => {
    try {
      if (!date || !time) return;

      set({ bookingLoading: true });

      const res = await getAvailableTableCategoriesApi(date, time);

      set({
        availableCategories: res.data,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to load available categories");
    } finally {
      set({ bookingLoading: false });
    }
  },
  fetchAvailableTables: async (
    date,
    time,
    categoryId,
    bookingId
  ) => {
    try {
      if (!date || !time || !categoryId) return;

      set({ bookingLoading: true });

      const res = await getAvailableTablesApi(
        date,
        time,
        categoryId,
        bookingId
      );

      set({
        availableTables: res.data,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to load available tables");
    } finally {
      set({ bookingLoading: false });
    }
  },
}));