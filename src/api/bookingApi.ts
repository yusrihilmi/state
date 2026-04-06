// src/api/bookingApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export type BookingStatus =
  | "waiting_list"
  | "confirm"
  | "cancelled"
  | "seated"
  | "completed";

export interface BookingCustomer {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  instagram: string;
}

export interface BookingMenu {
  id: number;
  name: string;
  photo?: string;
  description?: string;
  price: string;
}

export interface BookingTable {
  id: number;
  number: string;
  covers: number;
}

export interface CloseOut {
  fromDate: string;
  toDate: string;
  fromTime: string;
  untilTime: string;
  tableIds: number[];
}

export interface Booking {
  id: number;
  customer: BookingCustomer;
  date: string;
  time: string;
  channel?: string;
  excpectedLeaveTime?: string;
  totalPax: number;
  spendMoney: number;
  note?: string;
  bookingCode?: string;
  tables: BookingTable[];
  menus: BookingMenu[];
  status: BookingStatus;
}

export interface BookingListResponse {
  status: string;
  message: string;
  data: {
    items: Booking[];
    total: number;
    page: number;
    limit: number;
    closeOuts: CloseOut[];
    totalBooking: number;
    totalPax: number;
    totalSpent: number; 
  };
}

export interface BookingSingleResponse {
  status: string;
  message: string;
  data: Booking;
}

export interface BookingFilterParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  search?: string;
  statusDp?: string;
}

/* ================= API ================= */

// ================= UPDATE DP =================
export const updateBookingDpApi = async (
  id: number,
  formData: FormData
): Promise<BookingSingleResponse> => {
  return fetchWithAuth<BookingSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking/update-dp/${id}`,
    {
      method: "POST", // ⚠️ biasanya endpoint DP pakai POST
      body: formData,
    }
  );
};

// GET
export const getBookingApi = async (
  page: number,
  limit: number,
  filters?: BookingFilterParams
): Promise<BookingListResponse> => {
  const query = new URLSearchParams();

  if (filters?.fromDate) query.append("fromDate", filters.fromDate);
  if (filters?.toDate) query.append("toDate", filters.toDate);
  if (filters?.status) query.append("status", filters.status);
  if (filters?.search) query.append("search", filters.search);
  if (filters?.statusDp) query.append("statusDp", filters.statusDp);

  return fetchWithAuth<BookingListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking/${page}/${limit}?${query.toString()}`,
    { method: "GET" }
  );
};

// POST (multipart/form-data)
export const createBookingApi = async (
  formData: FormData
): Promise<BookingSingleResponse> => {
  return fetchWithAuth<BookingSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking`,
    {
      method: "POST",
      body: formData,
    }
  );
};

// PATCH (multipart/form-data)
export const updateBookingApi = async (
  id: number,
  formData: FormData
): Promise<BookingSingleResponse> => {
  return fetchWithAuth<BookingSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking/${id}`,
    {
      method: "PATCH",
      body: formData,
    }
  );
};

// DELETE
export const deleteBookingApi = async (
  id: number
): Promise<BookingSingleResponse> => {
  return fetchWithAuth<BookingSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking/${id}`,
    {
      method: "DELETE",
    }
  );
};