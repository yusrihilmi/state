import { useEffect, useState } from "react";
import ResetNewPasswordForm from "../components/organisms/ResetNewPasswordForm";
import loginImage from "../assets/login-image.png";
import logoMillbook from "../assets/logo-millbook.png";
import logoStateDefault from "../assets/logo-state.png";

export default function ResetPasswordPage() {
  const [logoState, setLogoState] = useState<string>(logoStateDefault);
  const [backgroundImage, setBackgroundImage] = useState<string>(loginImage);

  useEffect(() => {
    document.title = "MillBook Login";

    const layout = localStorage.getItem("layout");

    if (layout) {
      try {
        const parsedLayout = JSON.parse(layout);

        if (parsedLayout?.logo) {
          setLogoState(parsedLayout.logo);
        }

        // 🔥 tambah ini
        if (parsedLayout?.backgroundImage) {
          setBackgroundImage(parsedLayout.backgroundImage);
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
        src={backgroundImage}
        alt="Reset Password Background"
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
          <div className="text-center mb-4">
            <img
              src={logoState}
              alt="State"
              className="h-24 mx-auto rounded-full"
            />
          </div>

          {/* 🔥 Form Reset Password */}
          <ResetNewPasswordForm />
        </div>
      </div>
    </div>
  );
}