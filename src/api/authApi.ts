export interface RegisterPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  dob: string; // yyyy-mm-dd
}

export interface ResetPasswordAdminPayload {
  newPassword: string;
  confirmPassword: string;
}

export const resetPasswordAdminApi = async (
  payload: ResetPasswordAdminPayload
) => {
  const basicAuth = btoa(
    `${import.meta.env.VITE_BASIC_USERNAME}:${import.meta.env.VITE_BASIC_PASSWORD}`
  );

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password-admin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Reset password admin failed");
  }

  return res.json();
};

export const registerApi = async (payload: RegisterPayload) => {
  // const basicAuth = btoa(
  //   `${import.meta.env.VITE_BASIC_USERNAME}:${import.meta.env.VITE_BASIC_PASSWORD}`
  // );

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Register failed");
  }

  return res.json();
};


export const loginApi = async (
  username: string,
  password: string,
  captchaToken: string
) => {
  const basicAuth = btoa(
    `${import.meta.env.VITE_BASIC_USERNAME}:${import.meta.env.VITE_BASIC_PASSWORD}`
  );

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        username,
        password,
        captchaToken,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw err; // ✅ penting
  }

  return res.json();
};

export const generateOtpApi = async (email: string) => {
  const basicAuth = btoa(
    `${import.meta.env.VITE_BASIC_USERNAME}:${import.meta.env.VITE_BASIC_PASSWORD}`
  );

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/generate-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ email }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Generate OTP failed");
  }

  return res.json();
};

export interface ResetPasswordPayload {
  otp: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export const resetPasswordApi = async (payload: ResetPasswordPayload) => {
  const basicAuth = btoa(
    `${import.meta.env.VITE_BASIC_USERNAME}:${import.meta.env.VITE_BASIC_PASSWORD}`
  );

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Reset password failed");
  }

  return res.json();
};
