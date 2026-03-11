// src/stores/useReservationStore.ts
import { create } from "zustand";
import {
  postReservation,
  getReservationStyleApi,
  getPromotionApi,
  getMenuCategoriesApi,
  getMenusApi,
  getAvailableTimeSlotsApi,
  getAvailableTableCategoriesApi,
  getBookingByCodeApi
} from "../api/reservationApi";

import type {
  ReservationPayload,
  ReservationResponse,
  ReservationStyle,
  PromotionItem,
  MenuCategory,
  MenuItem,
  AvailableTableCategory,
  BookingDetail
} from "../api/reservationApi";


interface ReservationState {
  reservation: any | null;
  data: ReservationStyle | null; // data microsite
  loading: boolean;
  error: string | null;
  promotions: PromotionItem[];
  menuCategories: MenuCategory[];
  menus: MenuItem[];
  menuTotal: number;
  menuPage: number;
  menuLimit: number;
  resetBooking: any;
  availableTimeSlots: string[];
  availableTableCategories: AvailableTableCategory[];
  bookingDetail: BookingDetail | null;
  fetchBookingByCode: (code: string) => Promise<void>;
  fetchAvailableTableCategories: (date: string, time: string) => Promise<void>;
  fetchAvailableTimeSlots: (date: string) => Promise<void>;

  fetchMenuCategories: () => Promise<void>;
  fetchMenus: (categoryId: number, page?: number, limit?: number) => Promise<void>;

  setReservation: (data: any) => void;
  confirmReservation: (payload: ReservationPayload) => Promise<ReservationResponse | null>;
  fetchReservationStyle: () => Promise<ReservationStyle | null>;
  fetchPromotions: () => Promise<void>;
}

export const useReservationStore = create<ReservationState>((set, get) => ({

  reservation: null,
  data: null,
  loading: false,
  error: null,
  promotions: [],
  menuCategories: [],
  menus: [],
  menuTotal: 0,
  menuPage: 1,
  menuLimit: 10,
  availableTimeSlots: [],
  availableTableCategories: [],
  bookingDetail: null,

   resetBooking: () =>
    set({
      bookingDetail: null,
      error: null,
    }),

  fetchBookingByCode: async (code: string) => {
    try {
      set({ loading: true, error: null });

      const res = await getBookingByCodeApi(code);

      set({ bookingDetail: res });
    } catch (err: any) {
      console.error("Failed to fetch booking detail:", err);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAvailableTableCategories: async (date: string, time: string) => {
    try {
      set({ loading: true });

      const res = await getAvailableTableCategoriesApi(date, time);

      set({ availableTableCategories: res });
    } catch (err) {
      console.error("Failed to fetch available table categories", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchAvailableTimeSlots: async (date: string) => {
    try {
      set({ loading: true });
      const res = await getAvailableTimeSlotsApi(date);
      set({ availableTimeSlots: res });
    } catch (err) {
      console.error("Failed to fetch available time slots", err);
    } finally {
      set({ loading: false });
    }
  },


  setReservation: (data) => set({ reservation: data }),

  fetchMenuCategories: async () => {
    try {
      set({ loading: true });
      const res = await getMenuCategoriesApi();
      set({ menuCategories: res });
    } catch (err) {
      console.error("Failed to fetch menu categories", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchMenus: async (categoryId, page = 1, limit = 10) => {
    try {
      set({ loading: true });
      const res = await getMenusApi(categoryId, page, limit);

      set((state) => ({
        menus:
          res.page === 1
            ? res.items
            : [...state.menus, ...res.items],
        menuTotal: res.total,
        menuPage: res.page,
        menuLimit: res.limit,
      }));

    } catch (err) {
      console.error("Failed to fetch menus", err);
    } finally {
      set({ loading: false });
    }
  },


  confirmReservation: async (payload) => {
    set({ loading: true, error: null });
    try {
      const result = await postReservation(payload);
      set({ loading: false });
      return result;
    } catch (err: any) {
      console.error("Reservation failed:", err);
      set({ loading: false, error: err.message });
      return null;
    }
  },
  fetchReservationStyle: async () => {
    const currentData = get().data;

    // ⛔ kalau sudah ada data, jangan fetch lagi
    if (currentData) {
      return currentData;
    }

    set({ loading: true, error: null });

    try {
      const data = await getReservationStyleApi();
      set({ data, loading: false });
      return data;
    } catch (err: any) {
      console.error("Fetch reservation style failed:", err);
      set({ loading: false, error: err.message });
      return null;
    }
  },


  fetchPromotions: async () => {
    try {
      set({ loading: true });
      const res = await getPromotionApi();
      set({ promotions: res });
    } catch (err) {
      console.error("Failed to fetch promotions", err);
    } finally {
      set({ loading: false });
    }
  },

}));
