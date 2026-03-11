// src/api/tableCategoryApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface TableCategory {
  id: number;
  name: string;
}

export interface TableCategoryListResponse {
  status: string;
  message: string;
  data: {
    items: TableCategory[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface TableCategorySingleResponse {
  status: string;
  message: string;
  data: TableCategory;
}

/* ================= API ================= */

// GET
export const getTableCategoryApi = async (
  page: number,
  limit: number
): Promise<TableCategoryListResponse> => {
  return fetchWithAuth<TableCategoryListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-categories/${page}/${limit}`,
    { method: "GET" }
  );
};

// POST
export const createTableCategoryApi = async (
  payload: { name: string }
): Promise<TableCategorySingleResponse> => {
  return fetchWithAuth<TableCategorySingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-categories`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateTableCategoryApi = async (
  id: number,
  payload: { name: string }
): Promise<TableCategorySingleResponse> => {
  return fetchWithAuth<TableCategorySingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteTableCategoryApi = async (
  id: number
): Promise<TableCategorySingleResponse> => {
  return fetchWithAuth<TableCategorySingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/table-categories/${id}`,
    {
      method: "DELETE",
    }
  );
};