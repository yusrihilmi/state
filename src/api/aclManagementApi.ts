// src/api/AclManagementApi.ts
import { fetchWithAuth } from "../utils/fetchWithAuth";

/* ================= TYPES ================= */

export interface MenuRole {
  id: number;
  roleId: number;
  menuId: number;
  menu: {
    id: number;
    name: string;
  };
  viewOnly: boolean;
  viewEdit: boolean;
  noAccess: boolean;
}

export interface AclManagement {
  id: number;
  name: string;
  roleIdDefault: number;
  roleDefault: {
    id: number;
    name: string;
  };
  menuRoles: MenuRole[];
}


export interface AclManagementListResponse {
  status: string;
  message: string;
  data: {
    items: AclManagement[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AclManagementDefaultResponse {
  status: string;
  message: string;
  data: AclManagement[]; // 🔥 ini yang bener
}


export interface AclManagementSingleResponse {
  status: string;
  message: string;
  data: AclManagement;
}

export interface MenuPayload {
  menuId: number;
  viewOnly: boolean;
  viewEdit: boolean;
  noAccess: boolean;
}

export interface AclManagementPayload {
  name: string;
  roleIdDefault: number;
  menus: MenuPayload[];
}

/* ================= API ================= */

// GET
export const getAclManagementApi = async (
  page: number,
  limit: number
): Promise<AclManagementListResponse> => {
  return fetchWithAuth<AclManagementListResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/acl/roles/${page}/${limit}`,
    { method: "GET" }
  );
};

export const getAclManagementDefaultApi = async (
): Promise<AclManagementDefaultResponse> => {
  return fetchWithAuth<AclManagementDefaultResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/acl/roles/defaults`,
    { method: "GET" }
  );
};

// POST
export const createAclManagementApi = async (
  payload: AclManagementPayload
): Promise<AclManagementSingleResponse> => {
  return fetchWithAuth<AclManagementSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/acl/roles`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

// PATCH
export const updateAclManagementApi = async (
  id: number,
  payload: AclManagementPayload
): Promise<AclManagementSingleResponse> => {
  return fetchWithAuth<AclManagementSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/acl/roles/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

// DELETE
export const deleteAclManagementApi = async (
  id: number
): Promise<AclManagementSingleResponse> => {
  return fetchWithAuth<AclManagementSingleResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/acl/roles/${id}`,
    {
      method: "DELETE",
    }
  );
};