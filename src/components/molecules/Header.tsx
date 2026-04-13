import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import logoMillbook from "../../assets/logo-millbook.png";
import { useNavigate } from "react-router-dom";
import { resetPasswordAdminApi } from "../../api/authApi";
import { toast } from "react-toastify";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [stateLogo, setStateLogo] = useState<string | null>(null); // state untuk logo
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = localStorage.getItem("auth-storage");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setUser(parsed.state?.user);
      } catch (err) {
        console.error("Failed to parse auth-storage:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    navigate("/state/office", { replace: true });
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

  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        toast.error("Password tidak boleh kosong");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Password tidak sama");
        return;
      }

      await resetPasswordAdminApi({
        newPassword,
        confirmPassword,
      });

      toast.success("Password berhasil diubah");

      setShowModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Gagal reset password");
    }
  };

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
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">

            <div className="flex flex-col gap-2 px-4 py-2">
              <p>
                {user?.fullName}
              </p>
              <p>
                {user?.username}
              </p>

            </div>

            {/* Change Password (role === 1) */}
            {user?.roleId === 1 && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setOpen(false);
                }}
                className="w-full flex text-start gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                Change Password
              </button>
            )}

            {/* Logout */}
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-80 p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>

            <div className="mb-3">
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={!newPassword || !confirmPassword}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}