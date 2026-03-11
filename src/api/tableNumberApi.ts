// src/api/tableNumberApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface TableNumberPayload {
  number: string;
  categoryId: number;
  covers: number;
}

export interface TableNumberDetail {
  id: number;
  number: string;
  covers: number;
  category: {
    id: number;
    name: string;
  };
}

export interface TableNumberListResponse {
  status: string;
  message: string;
  data: {
    items: TableNumberDetail[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface TableNumberSingleResponse {
  status: string;
  message: string;
  data: TableNumberDetail;
}

/* ================= BOOKING TYPES ================= */

export interface AvailableCategory {
  id: number;
  name: string;
}

export interface AvailableCategoriesResponse {
  status: string;
  message: string;
  data: AvailableCategory[];
}

export interface AvailableTable {
  id: number;
  number: string;
  covers: number;
}

export interface AvailableTablesResponse {
  status: string;
  message: string;
  data: AvailableTable[];
}

/* ================= API ================= */

export const getAvailableTableCategoriesApi = async (
  date: string,
  time: string
): Promise<AvailableCategoriesResponse> => {
  const query = new URLSearchParams({
    date,
    time,
  }).toString();

  return fetchWithAuth<AvailableCategoriesResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking/available-table-categories?${query}`,
    {
      method: "GET",
    }
  );
};

export const getAvailableTablesApi = async (
  date: string,
  time: string,
  categoryId: number,
  bookingId?: number
): Promise<AvailableTablesResponse> => {
  const query = new URLSearchParams({
    date,
    time,
    categoryId: categoryId.toString(),
    ...(bookingId ? { bookingId: bookingId.toString() } : {}),
  }).toString();

  return fetchWithAuth<AvailableTablesResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/booking/available-tables?${query}`,
    {
      method: "GET",
    }
  );
};

// GET
export const getTableNumberApi = async (
  page: number,
  limit: number
): Promise<TableNumberListResponse> => {
  return fetchWithAuth<TableNumberListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-management/${page}/${limit}`,
    { method: "GET" }
  );
};

// POST
export const createTableNumberApi = async (
  payload: TableNumberPayload
): Promise<TableNumberSingleResponse> => {
  return fetchWithAuth<TableNumberSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-management`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateTableNumberApi = async (
  id: number,
  payload: TableNumberPayload
): Promise<TableNumberSingleResponse> => {
  return fetchWithAuth<TableNumberSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-management/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteTableNumberApi = async (
  id: number
): Promise<void> => {
  return fetchWithAuth<void>(
    `${import.meta.env.VITE_API_BASE_URL}/table-management/${id}`,
    {
      method: "DELETE",
    }
  );
};