import { Link } from "react-router-dom";

interface Props {
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  isAdminError?: boolean;
  onForgotPassword?: () => void;
  loadingForgot?: boolean;
}

export default function RememberForgotRow({
  rememberMe,
  setRememberMe,
  isAdminError = false,
  onForgotPassword,
  loadingForgot,
}: Props) {
  return (
    <div className="flex items-center justify-center mb-6 text-sm text-white">

      {/* REMEMBER ME (masih hidden sesuai kode kamu) */}
      <label className="items-center gap-2 cursor-pointer hidden">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="text-primary focus:ring-primary"
        />
        Remember me
      </label>

      {/* RIGHT SIDE */}
      {isAdminError ? (
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={loadingForgot}
          className={`text-white text-center hover:underline hover:border-0 border-0 ${loadingForgot ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loadingForgot ? "Sending..." : "Forgot your password?"}
        </button>
      ) : (
        <Link to="reset-password" className="text-white text-center hover:underline hover:border-0 border-0">
          Forgot your password?
        </Link>
      )}
    </div>
  );
}