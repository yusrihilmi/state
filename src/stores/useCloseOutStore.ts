// src/stores/useCloseOutStore.ts
import { create } from "zustand";
import {
  getCloseOutApi,
  createCloseOutApi,
  updateCloseOutApi,
  deleteCloseOutApi,
} from "../api/closeOutApi";
import type { CloseOutItem, CloseOutPayload } from "../api/closeOutApi";

interface CloseOutState {
  closeOutTables: CloseOutItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;

  fetchCloseOuts: (page?: number, limit?: number) => Promise<void>;
  createCloseOut: (payload: CloseOutPayload) => Promise<void>;
  updateCloseOut: (id: number, payload: CloseOutPayload) => Promise<void>;
  deleteCloseOut: (id: number) => Promise<void>;
}

export const useCloseOutStore = create<CloseOutState>((set, get) => ({
  closeOutTables: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,

  /* ================= FETCH ================= */
  fetchCloseOuts: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });

      const res = await getCloseOutApi(page, limit);

      set({
        closeOutTables: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetchCloseOuts:", error);
      set({ loading: false });
    }
  },

  /* ================= CREATE ================= */
  createCloseOut: async (payload) => {
    try {
      await createCloseOutApi(payload);

      // auto refresh
      const { page, limit, fetchCloseOuts } = get();
      await fetchCloseOuts(page, limit);
    } catch (error) {
      console.error("Error createCloseOut:", error);
    }
  },

  /* ================= UPDATE ================= */
  updateCloseOut: async (id, payload) => {
    try {
      await updateCloseOutApi(id, payload);

      const { page, limit, fetchCloseOuts } = get();
      await fetchCloseOuts(page, limit);
    } catch (error) {
      console.error("Error updateCloseOut:", error);
    }
  },

  /* ================= DELETE ================= */
  deleteCloseOut: async (id) => {
    try {
      await deleteCloseOutApi(id);

      const { page, limit, fetchCloseOuts } = get();
      await fetchCloseOuts(page, limit);
    } catch (error) {
      console.error("Error deleteCloseOut:", error);
    }
  },
}));