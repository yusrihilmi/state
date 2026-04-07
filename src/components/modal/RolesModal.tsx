import { useEffect, useState } from "react";
import { useAclManagementStore } from "../../stores/useAclManagementStore";

export default function RolesModal({ open, data, onClose }: any) {
  const {
    createRole,
    updateRole,
    defaults,
    fetchRolesDefault,
  } = useAclManagementStore();

  const [name, setName] = useState("");
  const [roleDefault, setRoleDefault] = useState<number>(0);
  const [menus, setMenus] = useState<any[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [hasChangedRole, setHasChangedRole] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    fetchRolesDefault();
  }, []);

  /* ================= HANDLE OPEN ================= */
  useEffect(() => {
    if (!open) return;

    if (data) {
      setIsEdit(true);
      setHasChangedRole(false); // 🔥 reset

      setName(data.name || "");
      setRoleDefault(data.roleIdDefault || 0);

      const mappedMenus = data.menuRoles.map((m: any) => ({
        menuId: m.menuId,
        name: m.menu.name,
        viewOnly: m.viewOnly,
        viewEdit: m.viewEdit,
        noAccess: m.noAccess,
      }));

      setMenus(mappedMenus);
    } else {
      setIsEdit(false);
      setName("");
      setRoleDefault(0);
      setMenus([]);
      setHasChangedRole(false);
    }
  }, [open, data]);

  /* ================= APPLY DEFAULT ROLE ================= */
  useEffect(() => {
    if (!roleDefault) return;
    if (!defaults.length) return;

    // ❗ kalau edit & belum pernah ganti → pakai data lama
    if (isEdit && !hasChangedRole) return;

    const selectedRole = defaults.find((d) => d.id === roleDefault);
    if (!selectedRole) return;

    const mappedMenus = selectedRole.menuRoles.map((m: any) => ({
      menuId: m.menuId,
      name: m.menu.name,
      viewOnly: m.viewOnly,
      viewEdit: m.viewEdit,
      noAccess: m.noAccess,
    }));

    setMenus(mappedMenus);
  }, [roleDefault, defaults, isEdit, hasChangedRole]);

  if (!open) return null;

  /* ================= HANDLE CHECKBOX ================= */
  const handlePermissionChange = (
    menuId: number,
    type: "viewOnly" | "viewEdit" | "noAccess"
  ) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.menuId === menuId
          ? {
            ...m,
            viewOnly: type === "viewOnly",
            viewEdit: type === "viewEdit",
            noAccess: type === "noAccess",
          }
          : m
      )
    );
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!name) return;

    const payload = {
      name,
      roleIdDefault: roleDefault,
      menus: menus.map((m) => ({
        menuId: m.menuId,
        viewOnly: m.viewOnly,
        viewEdit: m.viewEdit,
        noAccess: m.noAccess,
      })),
    };

    if (data?.id) {
      await updateRole(data.id, payload);
    } else {
      await createRole(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[750px] rounded-lg p-5">
        <h3 className="font-semibold mb-4">
          {data ? "Edit Role" : "Add Role"}
        </h3>

        {/* ================= FORM ================= */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Role Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Role Default
            </label>
            <select
              value={roleDefault}
              onChange={(e) => {
                const newValue = Number(e.target.value);

                if (isEdit) {
                  setHasChangedRole(true); // 🔥 begitu berubah sekali
                }

                setRoleDefault(newValue);
              }}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value={0}>-- Select Role --</option>
              {defaults.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= PERMISSIONS ================= */}
        <div className="mt-6 overflow-y-auto h-72">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Menu</th>
                <th className="p-2">View Only</th>
                <th className="p-2">View Edit</th>
                <th className="p-2">No Access</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((m) => (
                <tr key={m.menuId} className="border-t">
                  <td className="p-2">{m.name}</td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={m.viewOnly}
                      onChange={() =>
                        handlePermissionChange(m.menuId, "viewOnly")
                      }
                    />
                  </td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={m.viewEdit}
                      onChange={() =>
                        handlePermissionChange(m.menuId, "viewEdit")
                      }
                    />
                  </td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={m.noAccess}
                      onChange={() =>
                        handlePermissionChange(m.menuId, "noAccess")
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= ACTION ================= */}
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