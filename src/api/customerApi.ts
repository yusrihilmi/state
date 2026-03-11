// src/api/customerApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface Customer {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  instagram: string;
  visit_time?: number;
}

export interface CustomerListResponse {
  status: string;
  message: string;
  data: {
    items: Customer[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CustomerSingleResponse {
  status: string;
  message: string;
  data: any;
}

export interface CustomerPayload {
  fullname: string;
  phone: string;
  email: string;
  instagram: string;
}

/* ================= BOOKING TYPES ================= */

export interface CustomerBooking {
  id: number;
  bookingCode: string;
  date: string;
  time: string;
  totalPax: number;
  note?: string;
  status: string;
  table?: {
    id: number;
    number: string;
    covers: number;
  };
  bookingMenus: {
    id: number;
    bookingId: number;
    menuId: number;
    qty: number;
    menu: {
      id: number;
      name: string;
      photo?: string;
      description?: string;
      price: string;
    };
  }[];
}

export interface CustomerBookingListResponse {
  status: string;
  message: string;
  data: {
    items: CustomerBooking[];
    total: number;
    page: number;
    limit: number;
  };
}

/* ================= GET CUSTOMER BOOKINGS ================= */

export const getCustomerBookingsApi = async (
  id: number,
  page: number,
  limit: number
): Promise<CustomerBookingListResponse> => {
  return fetchWithAuth<CustomerBookingListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${id}/bookings/${page}/${limit}`,
    { method: "GET" }
  );
};


// GET
export const getCustomerApi = async (
  page: number,
  limit: number,
  search?: string,
  fromDate?: string,
  toDate?: string
): Promise<CustomerListResponse> => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  const query = params.toString();

  const url = `${import.meta.env.VITE_API_BASE_URL}/customer/${page}/${limit}${
    query ? `?${query}` : ""
  }`;

  return fetchWithAuth<CustomerListResponse>(url, {
    method: "GET",
  });
};



// GET BY ID
export const getCustomerByIdApi = async (
  id: number
): Promise<CustomerSingleResponse> => {
  return fetchWithAuth<CustomerSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${id}`,
    { method: "GET" }
  );
};

// POST
export const createCustomerApi = async (
  payload: CustomerPayload
): Promise<CustomerSingleResponse> => {
  return fetchWithAuth<CustomerSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/customer`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateCustomerApi = async (
  id: number,
  payload: CustomerPayload
): Promise<CustomerSingleResponse> => {
  return fetchWithAuth<CustomerSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteCustomerApi = async (
  id: number
): Promise<CustomerSingleResponse> => {
  return fetchWithAuth<CustomerSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${id}`,
    {
      method: "DELETE",
    }
  );
};