// src/api/closeOutApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface CloseOutCategory {
  id: number;
  name: string;
}

export interface CloseOutBranch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface CloseOutItem {
  id: number;
  title: string;
  categories: CloseOutCategory[];
  fromDate: string;
  toDate: string;
  fromTime: string;
  untilTime: string;
  branch: CloseOutBranch;
}

export interface CloseOutListResponse {
  status: string;
  message: string;
  data: {
    items: CloseOutItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CloseOutSingleResponse {
  status: string;
  message: string;
  data: CloseOutItem;
}

export interface CloseOutPayload {
  title: string;
  categoryIds: number[];   // 🔥 ganti jadi array
  fromDate: string;
  toDate: string;
  fromTime: string;
  untilTime: string;
  branchId: number;
}

/* ================= API ================= */

// GET
export const getCloseOutApi = async (
  page: number,
  limit: number
): Promise<CloseOutListResponse> => {
  return fetchWithAuth<CloseOutListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/close-out/${page}/${limit}`,
    {
      method: "GET",
    }
  );
};

// POST
export const createCloseOutApi = async (
  payload: CloseOutPayload
): Promise<CloseOutSingleResponse> => {
  return fetchWithAuth<CloseOutSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/close-out`,
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
export const updateCloseOutApi = async (
  id: number,
  payload: CloseOutPayload
): Promise<CloseOutSingleResponse> => {
  return fetchWithAuth<CloseOutSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/close-out/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteCloseOutApi = async (id: number): Promise<void> => {
  return fetchWithAuth<void>(
    `${import.meta.env.VITE_API_BASE_URL}/close-out/${id}`,
    {
      method: "DELETE",
    }
  );
};