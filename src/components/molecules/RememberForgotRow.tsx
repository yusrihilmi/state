// import { Link } from "react-router-dom";

interface Props {
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
}

export default function RememberForgotRow({
  rememberMe,
  setRememberMe,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6 text-sm text-white">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="text-primary focus:ring-primary"
        />
        Remember me
      </label>

      {/* <Link to="/reset-password" className="text-[#1D626D] hover:underline">
        Forgot your password?
      </Link> */}
    </div>
  );
}
