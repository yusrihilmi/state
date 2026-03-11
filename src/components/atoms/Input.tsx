interface InputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function Input({
  id,
  type = "text",
  value,
  onChange,
  className = "",
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full px-3 !bg-transparent ${className}`}
    />
  );
}
