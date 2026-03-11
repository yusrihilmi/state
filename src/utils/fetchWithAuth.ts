// src/utils/fetchWithAuth.ts
import { useAuthStore } from "../stores/useAuthStore";
import { refreshTokenApi } from "../api/refreshTokenApi";

export const fetchWithAuth = async <T>(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<T> => {
  const { token, setToken, logout } = useAuthStore.getState();

  if (!token?.accessToken) {
    throw new Error("Missing authentication token");
  }

  const isFormData = init.body instanceof FormData;

  const authInit: RequestInit = {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
      Authorization: `Bearer ${token.accessToken}`,
    },
  };

  let res: Response;

  try {
    res = await fetch(input, authInit);
  } catch {
    throw new Error("Image size is too large. Please upload smaller images.");
  }

  // 🔁 refresh token
  if (res.status === 401) {
    try {
      const refreshed = await refreshTokenApi(token.refreshToken);

      const newAccessToken = refreshed.data.token.access_token;
      const newRefreshToken = refreshed.data.token.refresh_token;

      setToken({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      const retryInit: RequestInit = {
        ...init,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...init.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };

      res = await fetch(input, retryInit);
    } catch {
      logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!res.ok) {
    let errorBody: any = null;
    try {
      errorBody = await res.json();
    } catch { }

    throw new Error(
      errorBody?.message ||
      errorBody?.error ||
      `Request failed with status ${res.status}`
    );
  }

  return res.json() as Promise<T>;
};