// src/stores/useSpecialRequestStore.ts
import { create } from "zustand";
import {
  getSpecialRequestApi,
  updateSpecialRequestApi,
  createSpecialRequestApi,
} from "../api/specialRequestApi";

import type {
  SpecialRequestItem,
  SpecialRequestPayload,
} from "../api/specialRequestApi";

interface SpecialRequestState {
  specialRequests: SpecialRequestItem[];
  loading: boolean;

  fetchSpecialRequests: () => Promise<void>;
  updateSpecialRequest: (id: number, payload: SpecialRequestPayload) => Promise<void>;
  createSpecialRequest: (payload: SpecialRequestPayload) => Promise<void>;
}

export const useSpecialRequestStore = create<SpecialRequestState>((set, get) => ({
  specialRequests: [],
  loading: false,

  /* ================= FETCH ================= */
  fetchSpecialRequests: async () => {
    try {
      set({ loading: true });

      const res = await getSpecialRequestApi();

      set({
        specialRequests: res.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetchSpecialRequests:", error);
      set({ loading: false });
    }
  },

  /* ================= UPDATE ================= */
  updateSpecialRequest: async (id, payload) => {
    try {
      await updateSpecialRequestApi(id, payload);

      // refresh data
      const { fetchSpecialRequests } = get();
      await fetchSpecialRequests();
    } catch (error) {
      console.error("Error updateSpecialRequest:", error);
    }
  },

  /* ================= CREATE ================= */
  createSpecialRequest: async (payload) => {
    try {
      await createSpecialRequestApi(payload);

      const { fetchSpecialRequests } = get();
      await fetchSpecialRequests();
    } catch (error) {
      console.error("Error createSpecialRequest:", error);
    }
  },
}));