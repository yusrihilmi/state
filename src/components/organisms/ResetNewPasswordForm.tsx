import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import InputField from "../molecules/InputField";
import Button from "../atoms/Button";
import { toast } from "react-toastify";
import { resetPasswordApi } from "../../api/authApi";

export default function ResetNewPasswordForm() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ambil email dari halaman sebelumnya
  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!email) {
      setError("Email tidak ditemukan, ulangi proses");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPasswordApi({
        otp,
        email,
        newPassword,
        confirmPassword,
      });

      toast.success("Password berhasil direset!");

      setTimeout(() => {
        navigate("/state/office");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <h2 className="text-2xl text-white font-semibold mb-2">
        Reset Password
      </h2>
      <p className="text-white mb-6">
        Masukkan OTP dan password baru kamu.
      </p>

      <InputField
        label="Email"
        id="email"
        type="text"
        value={email || ""}
        readOnly
        onChange={() => { }} // boleh kosong karena readonly
      />

      <InputField
        label="New Password"
        id="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <InputField
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={error}
      />

      <InputField
        label="OTP Code"
        id="otp"
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? "Processing..." : "Reset Password"}
      </Button>

      <p className="text-sm text-center mt-4 text-white">
        Remember your password?{" "}
        <Link
          to="/state/office"
          className="text-primary hover:underline font-medium"
        >
          Back to Login
        </Link>
      </p>
    </form>
  );
}