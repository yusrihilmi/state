type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox({ className = "", ...props }: CheckboxProps) {
  return <input type="checkbox" className={`w-4 h-4 accent-green-600 ${className}`} {...props} />;
}
