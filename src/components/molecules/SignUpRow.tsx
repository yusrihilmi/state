import { Link } from "react-router-dom";

export default function SignUpRow() {
  return (
    <div className="flex items-center justify-center mb-6 text-sm">
      <p>Dont have an account?</p>
      <Link to="/register" className="text-[#1D626D] !py-0 !px-2 hover:underline">
        Sign up now
      </Link>
    </div>
  );
}
