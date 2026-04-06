import { useState } from "react";
import Label from "../atoms/Label";
import Input from "../atoms/Input";
import ErrorText from "../atoms/ErrorText";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  readOnly?: boolean;
}

export default function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  readOnly,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <Label htmlFor={id}>{label}</Label>

      <div
        className={`mt-1 flex items-center rounded-md border border-white/40 backdrop-blur-sm
        ${readOnly ? "bg-gray-100" : "bg-white/80"}
        focus-within:border-[#C9A24D]`}
      >
        <Input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={readOnly ? undefined : onChange}
          readOnly={readOnly}
          className={`flex-1 text-gray-800 placeholder-gray-500 ${
            readOnly ? "cursor-not-allowed" : ""
          }`}
        />

        {/* 👁 ICON */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="px-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}