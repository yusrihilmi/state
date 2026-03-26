// src/api/specialRequestApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface SpecialRequestItem {
  id: number;
  title: string;
}

export interface SpecialRequestResponse {
  status: string;
  message: string;
  data: SpecialRequestItem[];
}

export interface SpecialRequestPayload {
  title: string;
}

/* ================= API ================= */

// GET ALL
export const getSpecialRequestApi = async (): Promise<SpecialRequestResponse> => {
  return fetchWithAuth<SpecialRequestResponse>(
    `https://millbook.id/api/special-request`,
    {
      method: "GET",
    }
  );
};

// PATCH
export const updateSpecialRequestApi = async (
  id: number,
  payload: SpecialRequestPayload
): Promise<any> => {
  return fetchWithAuth<any>(
    `${import.meta.env.VITE_API_BASE_URL}/special-request/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};

// (OPTIONAL) CREATE - kalau nanti ada endpoint
export const createSpecialRequestApi = async (
  payload: SpecialRequestPayload
): Promise<any> => {
  return fetchWithAuth<any>(
    `${import.meta.env.VITE_API_BASE_URL}/special-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};