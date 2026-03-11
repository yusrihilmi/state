import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getCustomerApi,
  getCustomerByIdApi, // 🔥 tambah
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  getCustomerBookingsApi,
} from "../api/customerApi";
import type { Customer, CustomerPayload, CustomerBooking } from "../api/customerApi";

interface CustomerState {
  items: Customer[];
  current: Customer | null;
  total: number;
  page: number;
  limit: number;
  listLoading: boolean;
  bookingLoading: boolean;

  filters: {
    search?: string;
    fromDate?: string;
    toDate?: string;
  };

  bookingItems: CustomerBooking[];
  bookingTotal: number;
  bookingPage: number;
  bookingLimit: number;

  fetchCustomerBookings: (
    customerId: number,
    page?: number,
    limit?: number
  ) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<CustomerState["filters"]>) => void;

  fetchCustomers: (page?: number, limit?: number) => Promise<void>;
  fetchCustomerById: (id: number) => Promise<void>;
  createCustomer: (payload: CustomerPayload) => Promise<Customer>;
  updateCustomer: (id: number, payload: CustomerPayload) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  clearCustomer: () => void;
}


export const useCustomerStore = create<CustomerState>((set, get) => ({
  items: [],
  current: null,
  total: 0,
  page: 1,
  limit: 10,
  search: "",
  listLoading: false,
  bookingLoading: false,
  filters: {},

  bookingItems: [],
  bookingTotal: 0,
  bookingPage: 1,
  bookingLimit: 10,
  setPage: (page) => set({ page }),
  /* ================= GET CUSTOMER BOOKINGS ================= */
  fetchCustomerBookings: async (
    customerId,
    page = 1,
    limit = 10
  ) => {
    try {
      set({ bookingLoading: true });

      const res = await getCustomerBookingsApi(
        customerId,
        page,
        limit
      );

      set({
        bookingItems: res.data.items,
        bookingTotal: res.data.total,
        bookingPage: res.data.page,
        bookingLimit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load customer bookings");
    } finally {
      set({ bookingLoading: false });
    }
  },



  setFilters: (newFilters) => {
    set(() => ({
      filters: newFilters, // 🔥 REPLACE TOTAL
      page: 1,
    }));
  },

  clearCustomer: () => {
    set({ current: null });
  },
  /* ================= GET LIST ================= */
  fetchCustomers: async (page = 1, limit = 10) => {
    try {
      set({ listLoading: true });

      const { filters } = get();

      const res = await getCustomerApi(
        page,
        limit,
        filters.search,
        filters.fromDate,
        filters.toDate
      );

      set({
        items: res.data.items,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      });
    } catch {
      toast.error("Failed to load customers");
    } finally {
      set({ listLoading: false });
    }
  },



  /* ================= GET BY ID ================= */
  fetchCustomerById: async (id) => {
    try {
      set({ listLoading: true });

      const res = await getCustomerByIdApi(id);

      set({ current: res.data });
    } catch {
      toast.error("Failed to load customer detail");
    } finally {
      set({ listLoading: false });
    }
  },

  /* ================= POST ================= */
  createCustomer: async (payload) => {
    try {
      const res = await createCustomerApi(payload);

      toast.success("Customer created");

      const { page, limit, fetchCustomers } = get();
      fetchCustomers(page, limit);

      return res.data; // 🔥 RETURN DATA
    } catch (err) {
      toast.error("Failed to create customer");
      throw err;
    }
  },


  /* ================= PATCH ================= */
  updateCustomer: async (id, payload) => {
    try {
      await updateCustomerApi(id, payload);
      toast.success("Customer updated");

      const { page, limit, fetchCustomers } = get();
      fetchCustomers(page, limit);
    } catch {
      toast.error("Failed to update customer");
    }
  },

  /* ================= DELETE ================= */
  deleteCustomer: async (id) => {
    try {
      await deleteCustomerApi(id);
      toast.success("Customer deleted");

      const { page, limit, fetchCustomers } = get();
      fetchCustomers(page, limit);
    } catch {
      toast.error("Failed to delete customer");
    }
  },
}));