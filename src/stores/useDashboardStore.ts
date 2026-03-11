import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getDashboardSummaryApi,
  getDashboardBookingsByTimeApi,
} from "../api/dashboardApi";

import type {
  DashboardSummaryResponse,
  DashboardBookingsByTimeItem,
} from "../api/dashboardApi";

interface DashboardState {
  summary: DashboardSummaryResponse | null;
  bookingsByTime: DashboardBookingsByTimeItem[];
  loading: boolean;
  fromDate?: string;
  toDate?: string;

  setDateFilter: (from?: string, to?: string) => void;
  fetchSummary: () => Promise<void>;
  fetchBookingsByTime: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  bookingsByTime: [],
  loading: false,
  fromDate: undefined,
  toDate: undefined,

  setDateFilter: (from, to) => {
    set({ fromDate: from, toDate: to });
  },

  fetchBookingsByTime: async () => {
    try {
      set({ loading: true });

      const { fromDate, toDate } = get();

      const res = await getDashboardBookingsByTimeApi(fromDate, toDate);

      set({
        bookingsByTime: res.data || [],
      });
    } catch (err) {
      toast.error("Failed to load bookings by time");
    } finally {
      set({ loading: false });
    }
  },

  fetchSummary: async () => {
    try {
      set({ loading: true });

      const { fromDate, toDate } = get();

      const res = await getDashboardSummaryApi(fromDate, toDate);

      set({
        summary: res.data,
      });
    } catch (err) {
      toast.error("Failed to load dashboard summary");
    } finally {
      set({ loading: false });
    }
  },
}));