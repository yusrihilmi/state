// src/api/menuCategoryApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface MenuCategory {
  id: number;
  name: string;
}

export interface MenuCategoryListResponse {
  status: string;
  message: string;
  data: {
    items: MenuCategory[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface MenuCategorySingleResponse {
  status: string;
  message: string;
  data: MenuCategory;
}

/* ================= API ================= */

// GET
export const getMenuCategoryApi = async (
  page: number,
  limit: number
): Promise<MenuCategoryListResponse> => {
  return fetchWithAuth<MenuCategoryListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-categories/${page}/${limit}`,
    { method: "GET" }
  );
};

// POST
export const createMenuCategoryApi = async (
  payload: { name: string }
): Promise<MenuCategorySingleResponse> => {
  return fetchWithAuth<MenuCategorySingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-categories`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateMenuCategoryApi = async (
  id: number,
  payload: { name: string }
): Promise<MenuCategorySingleResponse> => {
  return fetchWithAuth<MenuCategorySingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteMenuCategoryApi = async (
  id: number
): Promise<MenuCategorySingleResponse> => {
  return fetchWithAuth<MenuCategorySingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-categories/${id}`,
    {
      method: "DELETE",
    }
  );
};