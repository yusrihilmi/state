// src/api/restaurantSettingApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface RestaurantSetting {
  id: number;
  logo: string;
  name: string;
  description: string;
  address: string;
  accountNumber: string;
  termsNConditions: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  layout: string;
  primaryColor: string;
  secondaryColor: string;
  buttonHoverColor: string;
  openHourss: string;
  closedHours: string;
  status: string;
  stayDuration: number;
}

export interface RestaurantSettingResponse {
  status: string;
  message: string;
  data: RestaurantSetting;
}

/* ================= API ================= */

// GET
export const getRestaurantSettingApi = async (
  tenantId: number
): Promise<RestaurantSettingResponse> => {
  return fetchWithAuth<RestaurantSettingResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/tenant/${tenantId}`,
    { method: "GET" }
  );
};

// PATCH (multipart/form-data)
export const updateRestaurantSettingApi = async (
  tenantId: number,
  payload: FormData
): Promise<RestaurantSettingResponse> => {
  return fetchWithAuth<RestaurantSettingResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/tenant/${tenantId}`,
    {
      method: "PATCH",
      body: payload,
      // ❗ jangan set Content-Type manual
    }
  );
};
