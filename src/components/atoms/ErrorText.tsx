interface ErrorTextProps {
  children: React.ReactNode;
}

export default function ErrorText({ children }: ErrorTextProps) {
  return <p className="text-red-500 text-sm mt-1">{children}</p>;
}
