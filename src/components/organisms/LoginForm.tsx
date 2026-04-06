import { useState, useEffect } from "react";
import InputField from "../molecules/InputField";
import RememberForgotRow from "../molecules/RememberForgotRow";
import Button from "../atoms/Button";
import { useAuthStore } from "../../stores/useAuthStore";
import { loginApi, generateOtpApi } from "../../api/authApi";
import { Turnstile } from "@marsidev/react-turnstile";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAdminError, setIsAdminError] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);

  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("remembered_username");
    const rememberedPassword = localStorage.getItem("remembered_password");

    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }

    if (rememberedPassword) {
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIsAdminError(false);

      if (!captchaToken) {
        setError("Silahkan verifikasi captcha terlebih dahulu");
        return;
      }

      const response = await loginApi(username, password, captchaToken);

      const { profile, token } = response.data;

      const access = profile.access || [];

      const hasReservationCalendar = access.some(
        (item: any) =>
          item.menu_id === 2 && (item.view_only || item.view_edit)
      );

      const hasBookingManagement = access.some(
        (item: any) =>
          item.menu_id === 3 && (item.view_only || item.view_edit)
      );

      let redirectPath = "/";

      if (hasReservationCalendar) {

        redirectPath = "/state/office/reservation-calendar";
      } else if (hasBookingManagement) {
        redirectPath = "/state/office/booking-management";
      }

      const authData = {
        user: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullname,
          branchId: profile.branchId,
          roleId: profile.role_id,
          access: profile.access,
        },
        token: {
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
        },
      };

      login(authData);


      window.location.href = redirectPath;

    } catch (err: any) {
      console.log("ERR LOGIN:", err);

      if (err?.data?.isAdmin) {
        setIsAdminError(true);
        setError("Password salah untuk admin");
      } else {
        setError("Username atau password salah");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!username) {
        setError("Masukkan email terlebih dahulu");
        return;
      }

      setLoadingForgot(true);

      await generateOtpApi(username);

      toast.success("OTP berhasil dikirim ke email");

      navigate("/state/office/reset-password", {
        state: { email: username },
      });

    } catch (err: any) {
      setError(err.message || "Gagal kirim OTP");
    } finally {
      setLoadingForgot(false);
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



      {/* ✅ Forgot Password muncul kalau admin error */}
      {isAdminError && (
        <RememberForgotRow
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          isAdminError={isAdminError}
          onForgotPassword={handleForgotPassword}
          loadingForgot={loadingForgot}
        />
      )}

      <div className="my-4 flex justify-center">
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          onSuccess={(token) => {
            setCaptchaToken(token);
            console.log("token", token)
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