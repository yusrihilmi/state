// src/api/reservationApi.ts
export interface ReservationPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerInstagram?: string;
  date: string;
  time: string;
  guest: number;
  note?: string;
  orderedMenu?: Array<{ id: number; name: string; price: number; qty: number }>;
}

export interface ReservationResponse {
  bookingCode: string;
  id: number;
  [key: string]: any;
}

export interface ReservationStyle {
  id: number;
  logo: string;
  name: string;
  description: string;
  address: string;
  accountNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  layout: string;
  minimumPax: number;
  minimumDP: number;
  minimumPercentage: number;
  minimumPayment: number;
  primaryColor: string;
  secondaryColor: string;
  buttonHoverColor: string;
}

export interface ReservationStyleResponse {
  status: string;
  message: string;
  data: ReservationStyle;
}

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
  data: PromotionItem [];
}

export interface MenuCategory {
  id: number;
  name: string;
}

export interface MenuCategoryResponse {
  status: string;
  message: string;
  data: MenuCategory[];
}

// ================= MENU =================

export interface MenuItem {
  id: number;
  name: string;
  photo?: string;
  description: string;
  price: string;
  category: {
    id: number;
    name: string;
  };
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

export interface AvailableTimeSlotsResponse {
  status: string;
  message: string;
  data: string[];
}

export interface AvailableTableCategory {
  id: number;
  name: string;
}

export interface AvailableTableCategoriesResponse {
  status: string;
  message: string;
  data: AvailableTableCategory[];
}

// ================= BOOKING DETAIL =================

export interface BookingCustomer {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  instagram: string;
}

export interface BookingTable {
  id: number;
  number: string;
  covers: number;
}

export interface BookingMenuItem {
  id: number;
  bookingId: number;
  menuId: number;
  qty: number;
  menu: {
    id: number;
    name: string;
    photo?: string;
    description: string;
    price: string;
    status: boolean;
  };
}

export interface BookingBranch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface BookingDetail {
  id: number;
  bookingCode: string;
  customer: BookingCustomer;
  date: string;
  time: string;
  totalPax: number;
  note: string;
  downpaymentProof: string | null;
  spendMoney: string | null;
  expectedLeaveTime: string;
  channel: string;
  leaveTime: string | null;
  needDp: boolean;
  statusDp: string | null;
  referenceNumber: string;
  tables: BookingTable[];
  branch: BookingBranch;
  bookingMenus: BookingMenuItem[];
  status: string;
}

export interface BookingDetailResponse {
  status: string;
  message: string;
  data: BookingDetail;
}

export const getBookingByCodeApi = async (
  code: string
): Promise<BookingDetail> => {
  const response = await fetch(
    `https://state.genbio.id/microsite/bookings/${code}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch booking detail");
  }

  const result: BookingDetailResponse = await response.json();
  return result.data;
};

export const getAvailableTableCategoriesApi = async (
  date: string,
  time: string
): Promise<AvailableTableCategory[]> => {
  const response = await fetch(
    `https://state.genbio.id/microsite/available-table-categories?date=${date}&time=${time}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch available table categories");
  }

  const result: AvailableTableCategoriesResponse = await response.json();
  return result.data; // [{ id: 1, name: "Indoor" }]
};

export const getAvailableTimeSlotsApi = async (
  date: string
): Promise<string[]> => {
  const response = await fetch(
    `https://state.genbio.id/microsite/available-time-slots?date=${date}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch available time slots");
  }

  const result: AvailableTimeSlotsResponse = await response.json();
  return result.data; // array of "09:00", "09:15", dst
};

// GET menu categories
export const getMenuCategoriesApi = async (): Promise<MenuCategory[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/microsite/menu-categories`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch menu categories");
  }

  const result: MenuCategoryResponse = await response.json();
  return result.data;
};

// GET menus by category
export const getMenusApi = async (
  categoryId: number,
  page = 1,
  limit = 10
): Promise<MenuListResponse["data"]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/microsite/menus?categoryId=${categoryId}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch menus");
  }

  const result: MenuListResponse = await response.json();
  return result.data;
};


// POST reservation
export async function postReservation(payload: ReservationPayload): Promise<ReservationResponse> {
  const response = await fetch("https://state.genbio.id/microsite/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Booking failed");
  }

  return response.json();
}

// GET reservation style
export const getReservationStyleApi = async (): Promise<ReservationStyle> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/microsite/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch reservation style");
  }

  const result: ReservationStyleResponse = await response.json();
  return result.data;
};

export const getPromotionApi = async (): Promise<PromotionItem[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/microsite/promotions`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch promotions");
  }

  const result: PromotionListResponse = await response.json();
  return result.data; // ini array
};
