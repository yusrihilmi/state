import { useState } from "react";
import InputField from "../molecules/InputField";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function ResetNewPasswordForm() {
  const [email] = useState("user@email.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
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
        Enter your new password below to reset your account.
      </p>

      <div className="relative mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="w-full border rounded-md p-2 pr-10 bg-gray-100 cursor-not-allowed text-gray-600"
        />
        <CheckCircle
          size={20}
          className="absolute right-3 top-9 text-green-500"
        />
      </div>

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

      <Button type="submit" className="mt-4">
        Reset Password
      </Button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm text-center">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Password Reset Successful</h3>
            <p className="text-gray-600 mb-4">
              Your password has been updated successfully.
            </p>
            <Button onClick={handleClosePopup}>OK</Button>
          </div>
        </div>
      )}
    </form>
  );
}
