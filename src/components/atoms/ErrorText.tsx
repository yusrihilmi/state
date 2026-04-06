interface ErrorTextProps {
  children: React.ReactNode;
}

export default function ErrorText({ children }: ErrorTextProps) {
  return <p className="text-red-500 text-sm text-center bg-gray-100 rounded-md mt-2">{children}</p>;
}
