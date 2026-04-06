import { useEffect, useState } from "react";
import { useRoleManagementStore } from "../../stores/useRoleManagementStore";
import { useAclManagementStore } from "../../stores/useAclManagementStore";

export default function UserModal({ open, data, onClose }: any) {
  const { createRole, updateRole } = useRoleManagementStore();
  const { items: roles, fetchRoles } = useAclManagementStore();

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [role_id, setRole] = useState<number>(1);

  /* ================= FETCH ROLES ================= */
  useEffect(() => {
    fetchRoles(1, 100); // 🔥 ambil semua role
  }, []);

  /* ================= INIT ================= */
  useEffect(() => {
    if (data) {
      setUsername(data.username || "");
      setFullname(data.fullname || "");
      setPassword("");
      setRole(data.role_id ?? 1);
    } else {
      resetForm();
    }
  }, [data, open]);

  const resetForm = () => {
    setUsername("");
    setFullname("");
    setPassword("");
    setRole(1);
  };

  if (!open) return null;

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!username || !fullname) return;

    const payload = {
      username,
      fullname,
      password,
      role_id, // 🔥 ini dari dropdown (id role)
    };

    if (data?.id) {
      await updateRole(data.id, payload);
    } else {
      await createRole(payload);
    }

    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-lg p-5">
        <h3 className="font-semibold mb-4">
          {data ? "Edit User" : "Add User"}
        </h3>

        <div className="space-y-4">
          {/* USERNAME */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* FULLNAME */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Fullname
            </label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={data ? "Leave blank to keep" : ""}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* ROLE (DYNAMIC 🔥) */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Role
            </label>
            <select
              value={role_id}
              onChange={(e) => setRole(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}