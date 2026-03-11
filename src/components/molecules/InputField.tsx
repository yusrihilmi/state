import Label from "../atoms/Label";
import Input from "../atoms/Input";
import ErrorText from "../atoms/ErrorText";

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
}: InputFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={id}>
        {label}
      </Label>

      <div className="mt-1 rounded-md bg-white/80 backdrop-blur-sm border border-white/40 focus-within:border-[#C9A24D]">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="bg-transparent text-gray-800 placeholder-gray-500"
        />
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

