import { useState } from "react";
import InputField from "../molecules/InputField";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
      <p className="text-gray-500 mb-6">
        Input your account email, and we will send the reset code to your email.
      </p>

      <InputField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button type="submit">Send Reset Code</Button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-2">Reset Link Sent</h3>
            <p className="text-gray-600 mb-4">
              We have sent a password reset code to your email.
            </p>
            <Button onClick={handleClosePopup}>OK</Button>
          </div>
        </div>
      )}
    </form>
  );
}
