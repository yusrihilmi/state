import { useState } from "react";
import InputField from "../molecules/InputField";
// import RememberForgotRow from "../molecules/RememberForgotRow";
import Button from "../atoms/Button";
import { useAuthStore } from "../../stores/useAuthStore";
import { loginApi } from "../../api/authApi";
import { Turnstile } from "@marsidev/react-turnstile";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);

  // useEffect(() => {
  //   const rememberedUsername = localStorage.getItem("remembered_username");
  //   const rememberedPassword = localStorage.getItem("remembered_password");
  //   if (rememberedUsername) {
  //     setUsername(rememberedUsername);
  //     setRememberMe(true);
  //   }
  //   if (rememberedPassword) {
  //     setPassword(rememberedPassword);
  //     setRememberMe(true);
  //   }
  // }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("username dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!captchaToken) {
        setError("Silakan verifikasi captcha terlebih dahulu");
        return;
      }

      const response = await loginApi(username, password, captchaToken!);

      const { profile, token } = response.data;

      login({
        user: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullname,
          role: profile.role,
        },
        token: {
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
        },
      });

      // redirect berdasarkan role
      const redirectPath =
        profile.role === 4
          ? "/state/admin/booking-management"
          : "/state/admin/reservation-calendar";

      window.location.href = redirectPath;

    } catch (err) {
      setError("username atau password salah");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="w-full">

      <InputField
        label="Username"
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <InputField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />

      {/* <RememberForgotRow
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
      /> */}

      <div className="my-4 flex justify-center">
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          onSuccess={(token) => {
            setCaptchaToken(token);
          }}
          onExpire={() => {
            setCaptchaToken(null);
          }}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>

  );
}
