// src/stores/useBookingStore.ts
import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getBookingApi,
  createBookingApi,
  updateBookingApi,
  deleteBookingApi,
  updateBookingDpApi,
  cancelBookingDpApi
} from "../api/bookingApi";
import type { Booking } from "../api/bookingApi";

interface BookingFilters {
  fromDate?: string;
  toDate?: string;
  status?: string;
  search?: string;
  statusDp?: string;
}

interface CloseOut {
  fromDate: string;
  toDate: string;
  fromTime: string;
  untilTime: string;
  tableIds: number[];
}

interface BookingState {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  closeOuts: CloseOut[];
  totalBooking: number;
  totalPax: number;
  totalSpent: number;

  filters: BookingFilters;
  setFilters: (filters: Partial<BookingFilters>) => void;
  resetFilters: () => void;
  updateBookingDp: (id: number, formData: FormData) => Promise<void>;
  cancelBookingDp: (id: number) => Promise<void>;
  fetchBookings: (page?: number, limit?: number) => Promise<void>;
  createBooking: (formData: FormData) => Promise<void>;
  updateBooking: (id: number, formData: FormData) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  filters: {},
  closeOuts: [],
  totalBooking: 0,
  totalPax: 0,
  totalSpent: 0,

  resetFilters: () =>
    set({
      filters: {},
      page: 1,
    }),

  cancelBookingDp: async (id) => {
    try {
      await cancelBookingDpApi(id);
      toast.success("DP updated");

      const { page, limit } = get();
      get().fetchBookings(page, limit); // refresh data
    } catch (err: any) {
      toast.error(err?.message || "Failed to update DP");
    }
  },

  updateBookingDp: async (id, formData) => {
    try {
      await updateBookingDpApi(id, formData);
      toast.success("DP updated");

      const { page, limit } = get();
      get().fetchBookings(page, limit); // refresh data
    } catch (err: any) {
      toast.error(err?.message || "Failed to update DP");
    }
  },

  /* ================= SET FILTER ================= */
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // reset page biar balik ke awal
    }));
  },

  /* ================= FETCH ================= */
  fetchBookings: async (page = get().page, limit = get().limit) => {
    try {
      set({ loading: true });

      const { filters } = get();
      const res = await getBookingApi(page, limit, filters);

      set({
        items: res.data.items,
        total: res.data.total,
        closeOuts: res.data.closeOuts || [],
        totalBooking: res.data.totalBooking,
        totalPax: res.data.totalPax,
        totalSpent: res.data.totalSpent,

      });
    } catch {
      toast.error("Failed to load booking");
    } finally {
      set({ loading: false });
    }
  },


  /* ================= CREATE ================= */
  createBooking: async (formData) => {
    try {
      await createBookingApi(formData);
      toast.success("Booking created");

      const { page, limit } = get();
      get().fetchBookings(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create booking");
    }
  },

  /* ================= UPDATE ================= */
  updateBooking: async (id, formData) => {
    try {
      await updateBookingApi(id, formData);
      toast.success("Booking updated");

      const { page, limit } = get();
      get().fetchBookings(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update booking");
    }
  },

  /* ================= DELETE ================= */
  deleteBooking: async (id) => {
    try {
      await deleteBookingApi(id);
      toast.success("Booking deleted");

      const { page, limit } = get();
      get().fetchBookings(page, limit);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete booking");
    }
  },
}));
