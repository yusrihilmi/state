import { useEffect, useState } from "react";
import LoginForm from "../components/organisms/LoginForm";
import loginImage from "../assets/login-image.png";
import logoMillbook from "../assets/logo-millbook.png";
import logoStateDefault from "../assets/logo-state.png";

export default function LoginPage() {
  const [logoState, setLogoState] = useState<string>(logoStateDefault);

  useEffect(() => {
    document.title = "MillBook Login";

    const layout = localStorage.getItem("layout");

    if (layout) {
      try {
        const parsedLayout = JSON.parse(layout);

        if (parsedLayout?.logo) {
          setLogoState(parsedLayout.logo);
        }
      } catch (error) {
        console.error("Failed to parse layout:", error);
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen font-montserrat overflow-hidden">
      {/* Background */}
      <img
        src={loginImage}
        alt="Login Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Center card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-xl bg-white/20 backdrop-blur-sm shadow-2xl p-8 border border-white/30">
          
          {/* Logo Millbook */}
          <img
            src={logoMillbook}
            alt="Millbook"
            className="absolute top-4 right-4 h-10 opacity-90 rounded-full"
          />

          {/* Logo STATE */}
          <div className="text-center">
            <img
              src={logoState}
              alt="State"
              className="h-24 mx-auto rounded-full"
            />
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}