// src/stores/useNewsTodayStore.ts
import { create } from "zustand";
import {
  getNewsTodayApi,
  createNewsTodayApi,
  updateNewsTodayApi,
} from "../api/newsTodayApi";
import type {
  NewsTodayItem,
  NewsTodayPayload,
} from "../api/newsTodayApi";

interface NewsTodayState {
  newsToday: NewsTodayItem | null;
  loading: boolean;

  fetchNewsToday: () => Promise<void>;
  createNewsToday: (payload: NewsTodayPayload) => Promise<void>;
  updateNewsToday: (id: number, payload: NewsTodayPayload) => Promise<void>;
}

export const useNewsTodayStore = create<NewsTodayState>((set, get) => ({
  newsToday: null,
  loading: false,

  /* ================= FETCH ================= */
  fetchNewsToday: async () => {
    try {
      set({ loading: true });

      const res = await getNewsTodayApi();

      set({
        newsToday: res.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetchNewsToday:", error);
      set({ loading: false });
    }
  },

  /* ================= CREATE ================= */
  createNewsToday: async (payload) => {
    try {
      await createNewsTodayApi(payload);

      // auto refresh
      const { fetchNewsToday } = get();
      await fetchNewsToday();
    } catch (error) {
      console.error("Error createNewsToday:", error);
    }
  },

  /* ================= UPDATE ================= */
  updateNewsToday: async (id, payload) => {
    try {
      await updateNewsTodayApi(id, payload);

      const { fetchNewsToday } = get();
      await fetchNewsToday();
    } catch (error) {
      console.error("Error updateNewsToday:", error);
    }
  },
}));