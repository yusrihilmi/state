// src/api/newsTodayApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface NewsTodayItem {
  id: number;
  newsToday: string;
}

export interface NewsTodayResponse {
  status: string;
  message: string;
  data: NewsTodayItem;
}

export interface NewsTodayPayload {
  newsToday: string;
}

/* ================= API ================= */

// GET
export const getNewsTodayApi = async (): Promise<NewsTodayResponse> => {
  return fetchWithAuth<NewsTodayResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/news-today`,
    {
      method: "GET",
    }
  );
};

// POST
export const createNewsTodayApi = async (
  payload: NewsTodayPayload
): Promise<NewsTodayResponse> => {
  return fetchWithAuth<NewsTodayResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/news-today`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateNewsTodayApi = async (
  id: number,
  payload: NewsTodayPayload
): Promise<NewsTodayResponse> => {
  return fetchWithAuth<NewsTodayResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/news-today/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};