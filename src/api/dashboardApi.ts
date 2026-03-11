import { fetchWithAuth } from "../utils/fetchWithAuth";

export interface DashboardSummaryResponse {
  totalBookings: number;
  totalGuests: number;
  totalPax: number;
  avgPartySize: number;
  cancellationRate: number;
  breakdown: {
    waiting_list: number;
    confirm: number;
    seated: number;
    completed: number;
    cancelled: number;
  };
}

export interface DashboardBookingsByTimeResponse {
  fromDate: string;
  toDate: string;
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface DashboardBookingsByTimeItem {
  date: string;
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const getDashboardBookingsByTimeApi = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<DashboardBookingsByTimeItem[]>> => {
  const params = new URLSearchParams();

  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  return fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/dashboard/bookings-by-time?${params.toString()}`
  );
};

export const getDashboardSummaryApi = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<DashboardSummaryResponse>> => {
  const params = new URLSearchParams();

  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  return fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/dashboard/summary?${params.toString()}`
  );
};
