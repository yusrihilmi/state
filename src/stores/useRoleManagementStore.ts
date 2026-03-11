import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getRoleManagementApi,
  createRoleManagementApi,
  updateRoleManagementApi,
  deleteRoleManagementApi,
} from "../api/roleManagementApi";
import type {
  RoleManagement,
  RoleManagementPayload,
} from "../api/roleManagementApi";

interface RoleManagementState {
  items: RoleManagement[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;

  fetchRoles: (page?: number, limit?: number) => Promise<void>;
  createRole: (payload: RoleManagementPayload) => Promise<void>;
  updateRole: (id: number, payload: RoleManagementPayload) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
}

export const useRoleManagementStore = create<RoleManagementState>(
  (set, get) => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,

    /* ================= GET ================= */
    fetchRoles: async (page = 1, limit = 10) => {
      try {
        set({ loading: true });

        const res = await getRoleManagementApi(page, limit);

        set({
          items: res.data.items,
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
        });
      } catch {
        toast.error("Failed to load roles");
      } finally {
        set({ loading: false });
      }
    },

    /* ================= POST ================= */
    createRole: async (payload) => {
      try {
        await createRoleManagementApi(payload);
        toast.success("Role created");

        const { page, limit, fetchRoles } = get();
        fetchRoles(page, limit);
      } catch {
        toast.error("Failed to create role");
      }
    },

    /* ================= PATCH ================= */
    updateRole: async (id, payload) => {
      try {
        await updateRoleManagementApi(id, payload);
        toast.success("Role updated");

        const { page, limit, fetchRoles } = get();
        fetchRoles(page, limit);
      } catch {
        toast.error("Failed to update role");
      }
    },

    /* ================= DELETE ================= */
    deleteRole: async (id) => {
      try {
        await deleteRoleManagementApi(id);
        toast.success("Role deleted");

        const { page, limit, fetchRoles } = get();
        fetchRoles(page, limit);
      } catch {
        toast.error("Failed to delete role");
      }
    },
  })
);