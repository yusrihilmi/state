// src/stores/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AccessMenu {
  menu_id: number;
  name: string;
  view_only: boolean;
  view_edit: boolean;
  no_access: boolean;
}

interface UserData {
  id: number;
  username: string;
  fullName: string;
  branchId: number;
  roleId: number;
  access: AccessMenu[];
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: UserData | null;
  token: TokenData | null;
  login: (data: { user: UserData; token: TokenData }) => void;
  logout: () => void;
  setToken: (token: TokenData) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (data) => set({ user: data.user, token: data.token }),

      logout: () => set({ user: null, token: null }),

      setToken: (token) => set({ token }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
