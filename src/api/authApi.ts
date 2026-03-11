export interface RegisterPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  dob: string; // yyyy-mm-dd
}

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
    throw new Error(err?.message || "Login failed");
  }

  return res.json();
};
