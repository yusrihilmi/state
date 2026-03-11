// src/stores/usePromotionStore.ts
import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getPromotionApi,
  createPromotionApi,
  updatePromotionApi,
  deletePromotionApi,
} from "../api/promotionApi";
import type { PromotionItem } from "../api/promotionApi";
import { buildPromotionFormData } from "../utils/promotionFormData";
import type { PromotionPayload } from "../utils/promotionFormData";

interface PromotionState {
  items: PromotionItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;

  fetchPromotions: (page?: number, limit?: number) => Promise<void>;
  createPromotion: (payload: PromotionPayload) => Promise<void>;
  updatePromotion: (id: number, payload: PromotionPayload) => Promise<void>;
  deletePromotion: (id: number) => Promise<void>;
}

export const usePromotionStore = create<PromotionState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,

  /* ================= GET ================= */
  fetchPromotions: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });

      const res = await getPromotionApi(page, limit);

      set({
        items: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      set({ loading: false });
    }
  },

  /* ================= CREATE ================= */
  createPromotion: async (payload) => {
    try {
      const formData = buildPromotionFormData(payload);

      await createPromotionApi(formData);
      toast.success("Promotion created");

      const { page, limit, fetchPromotions } = get();
      fetchPromotions(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create promotion");
    }
  },

  /* ================= UPDATE ================= */
  updatePromotion: async (id, payload) => {
    try {
      const formData = buildPromotionFormData(payload);

      await updatePromotionApi(id, formData);
      toast.success("Promotion updated");

      const { page, limit, fetchPromotions } = get();
      fetchPromotions(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update promotion");
    }
  },

  /* ================= DELETE ================= */
  deletePromotion: async (id) => {
    try {
      await deletePromotionApi(id);
      toast.success("Promotion deleted");

      const { page, limit, fetchPromotions } = get();
      fetchPromotions(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete promotion");
    }
  },
}));