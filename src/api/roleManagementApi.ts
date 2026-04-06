// src/api/roleManagementApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface RoleManagement {
  id: number;
  username: string;
  fullname: string;
  password: string;
  role_id: number;
  roleId: number;
  role: any
}

export interface RoleManagementListResponse {
  status: string;
  message: string;
  data: {
    items: RoleManagement[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RoleManagementSingleResponse {
  status: string;
  message: string;
  data: RoleManagement;
}

export interface RoleManagementPayload {
  username: string;
  fullname: string;
  password: string;
  role_id: number;
}

/* ================= API ================= */

// GET
export const getRoleManagementApi = async (
  page: number,
  limit: number
): Promise<RoleManagementListResponse> => {
  return fetchWithAuth<RoleManagementListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/roles-management/${page}/${limit}`,
    { method: "GET" }
  );
};

// POST
export const createRoleManagementApi = async (
  payload: RoleManagementPayload
): Promise<RoleManagementSingleResponse> => {
  return fetchWithAuth<RoleManagementSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/roles-management`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateRoleManagementApi = async (
  id: number,
  payload: RoleManagementPayload
): Promise<RoleManagementSingleResponse> => {
  return fetchWithAuth<RoleManagementSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/roles-management/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteRoleManagementApi = async (
  id: number
): Promise<RoleManagementSingleResponse> => {
  return fetchWithAuth<RoleManagementSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/roles-management/${id}`,
    {
      method: "DELETE",
    }
  );
};