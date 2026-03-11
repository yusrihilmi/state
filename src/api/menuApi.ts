// src/api/menuApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface MenuCategory {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  status: boolean;
  photo?: string;
  description: string;
  price: string | number;
  category: MenuCategory;
}

export interface MenuListResponse {
  status: string;
  message: string;
  data: {
    items: MenuItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface MenuSingleResponse {
  status: string;
  message: string;
  data: MenuItem;
}

/* ================= API ================= */

// GET
export const getMenuApi = async (
  page: number,
  limit: number,
  categoryId?: number | "",
  searchName?: string | ""
): Promise<MenuListResponse> => {

  const params = new URLSearchParams();

  if (categoryId) params.append("categoryId", String(categoryId));
  if (searchName) params.append("search", searchName);

  return fetchWithAuth<MenuListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-management/${page}/${limit}?${params.toString()}`,
    { method: "GET" }
  );
};


// POST (multipart/form-data)
export const createMenuApi = async (
  formData: FormData
): Promise<MenuSingleResponse> => {
  return fetchWithAuth<MenuSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-management`,
    {
      method: "POST",
      body: formData,
    }
  );
};

// PATCH (multipart/form-data)
export const updateMenuApi = async (
  id: number,
  formData: FormData
): Promise<MenuSingleResponse> => {
  return fetchWithAuth<MenuSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-management/${id}`,
    {
      method: "PATCH",
      body: formData,
    }
  );
};

// DELETE
export const deleteMenuApi = async (id: number): Promise<void> => {
  return fetchWithAuth<void>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-management/${id}`,
    {
      method: "DELETE",
    }
  );
};

// PATCH STATUS (application/json)
export const updateMenuStatusApi = async (
  id: number,
  status: boolean
): Promise<void> => {
  return fetchWithAuth<void>(
    `${import.meta.env.VITE_API_BASE_URL}/menu-management/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );
};
