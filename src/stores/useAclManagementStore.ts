import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAclManagementApi,
  createAclManagementApi,
  updateAclManagementApi,
  deleteAclManagementApi,
  getAclManagementDefaultApi
} from "../api/aclManagementApi";
import type {
  AclManagement,
  AclManagementPayload,
} from "../api/aclManagementApi";

interface AclManagementState {
  items: AclManagement[];
  total: number;
  defaults: AclManagement[];
  page: number;
  limit: number;
  loading: boolean;

  fetchRoles: (page?: number, limit?: number) => Promise<void>;
  fetchRolesDefault: () => Promise<void>;
  createRole: (payload: AclManagementPayload) => Promise<void>;
  updateRole: (id: number, payload: AclManagementPayload) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
}

export const useAclManagementStore = create<AclManagementState>(
  (set, get) => ({
    items: [],
    defaults: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,

    /* ================= GET ================= */
    fetchRoles: async (page = 1, limit = 10) => {
      try {
        set({ loading: true });

        const res = await getAclManagementApi(page, limit);

        set({
          items: res.data.items,
          total: res.data.meta.total,
          page: res.data.meta.page,
          limit: res.data.meta.limit,
        });
      } catch {
        toast.error("Failed to load roles");
      } finally {
        set({ loading: false });
      }
    },

    fetchRolesDefault: async () => {
      try {
        set({ loading: true });

        const res = await getAclManagementDefaultApi();

        set({
          defaults: res.data, // ✅ langsung assign array
        });
      } catch {
        toast.error("Failed to load role defaults");
      } finally {
        set({ loading: false });
      }
    },

    /* ================= POST ================= */
    createRole: async (payload) => {
      try {
        await createAclManagementApi(payload);
        toast.success("Role created");

        const { page, limit, fetchRoles } = get();
        fetchRoles(page, limit);
      } catch {
        toast.error("Failed to create role");
      }
    },

    updateRole: async (id, payload) => {
      try {
        await updateAclManagementApi(id, payload);
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
        await deleteAclManagementApi(id);
        toast.success("Role deleted");

        const { page, limit, fetchRoles } = get();
        fetchRoles(page, limit);
      } catch {
        toast.error("Failed to delete role");
      }
    },
  })
);