import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import logoMillbook from "../../assets/logo-millbook.png";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [stateLogo, setStateLogo] = useState<string | null>(null); // state untuk logo
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/state/admin", { replace: true });
    localStorage.removeItem("auth-storage");
  };

  // Ambil logo dari localStorage
  useEffect(() => {
    const layoutData = localStorage.getItem("layout");
    if (layoutData) {
      try {
        const parsed = JSON.parse(layoutData);
        if (parsed.logo) {
          setStateLogo(parsed.logo);
        }
      } catch (err) {
        console.error("Failed to parse layout from localStorage:", err);
      }
    }
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 w-full bg-accent border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        {stateLogo ? (
          <img src={stateLogo} alt="State" className="h-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
            S
          </div>
        )}
        <img src={logoMillbook} alt="Millbook" className="h-8 rounded-full" />
      </div>

      {/* Right: Admin */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-transparent px-2 py-1 rounded-md"
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User size={18} />
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}