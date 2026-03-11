import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getRestaurantSettingApi,
  updateRestaurantSettingApi,
} from "../api/restaurantSettingApi";
import type { RestaurantSetting } from "../api/restaurantSettingApi";

interface RestaurantSettingState {
  data: RestaurantSetting | null;
  loading: boolean;

  fetchRestaurantSetting: (tenantId: number) => Promise<void>;
  updateRestaurantSetting: (
    tenantId: number,
    payload: FormData
  ) => Promise<void>;
  clearRestaurantSetting: () => void;
}

export const useRestaurantSettingStore = create<RestaurantSettingState>(
  (set) => ({
    data: null,
    loading: false,

    /* ================= GET ================= */
    fetchRestaurantSetting: async (tenantId) => {
      try {
        set({ loading: true });
        const res = await getRestaurantSettingApi(tenantId);
        set({ data: res.data });
      } catch {
        toast.error("Failed to load restaurant settings");
      } finally {
        set({ loading: false });
      }
    },

    /* ================= PATCH ================= */
    updateRestaurantSetting: async (tenantId, payload) => {
      try {
        set({ loading: true });
        const res = await updateRestaurantSettingApi(tenantId, payload);
        set({ data: res.data });
        toast.success(res.message || "Restaurant settings updated");
      } catch {
        toast.error("Failed to update restaurant settings");
      } finally {
        set({ loading: false });
      }
    },

    /* ================= CLEAR ================= */
    clearRestaurantSetting: () => {
      set({ data: null });
    },
  })
);
