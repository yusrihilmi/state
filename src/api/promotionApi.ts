// src/api/promotionApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface PromotionItem {
  id: number;
  photo?: string;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
}

export interface PromotionListResponse {
  status: string;
  message: string;
  data: {
    items: PromotionItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface PromotionSingleResponse {
  status: string;
  message: string;
  data: PromotionItem;
}

/* ================= API ================= */

// GET
export const getPromotionApi = async (
  page: number,
  limit: number
): Promise<PromotionListResponse> => {
  return fetchWithAuth<PromotionListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/promotion/${page}/${limit}`,
    { method: "GET" }
  );
};

// POST (FormData)
export const createPromotionApi = async (
  payload: FormData
): Promise<PromotionSingleResponse> => {
  return fetchWithAuth<PromotionSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/promotion`,
    {
      method: "POST",
      body: payload,
      headers: {}, // ⛔ jangan set Content-Type
    }
  );
};

// PATCH (FormData)
export const updatePromotionApi = async (
  id: number,
  payload: FormData
): Promise<PromotionSingleResponse> => {
  return fetchWithAuth<PromotionSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/promotion/${id}`,
    {
      method: "PATCH",
      body: payload,
      headers: {},
    }
  );
};

// DELETE
export const deletePromotionApi = async (
  id: number
): Promise<void> => {
  return fetchWithAuth<void>(
    `${import.meta.env.VITE_API_BASE_URL}/promotion/${id}`,
    { method: "DELETE" }
  );
};