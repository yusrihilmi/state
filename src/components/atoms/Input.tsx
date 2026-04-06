interface InputProps {
  id: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  readOnly?: boolean; // ✅ tambahin
}

export default function Input({
  id,
  type = "text",
  value,
  onChange,
  className = "",
  readOnly,
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly} // ✅ ini inti nya
      className={`w-full px-3 !bg-transparent h-10 ${className}`}
    />
  );
}