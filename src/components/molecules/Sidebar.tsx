import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { Menu, LayoutDashboard, CalendarDays, Album, HandPlatter, Utensils, Percent, Settings, Users, UserCog } from "lucide-react";

const menuItems = [
    {
        icon: LayoutDashboard,
        label: "Dashboard Summary",
        path: "/state/admin/dashboard-summary",
        allowedRoles: [1, 2, 6],
    },
    {
        icon: CalendarDays,
        label: "Reservation Calendar",
        path: "/state/admin/reservation-calendar",
        allowedRoles: [1, 2, 3, 6],
    },
    {
        icon: Album,
        label: "Booking Management",
        path: "/state/admin/booking-management",
        allowedRoles: [1, 2, 3, 4, 5, 6],
    },
    {
        icon: Utensils,
        label: "Menu Management",
        path: "/state/admin/menu-management",
        allowedRoles: [1, 2, 6],
    },
    {
        icon: HandPlatter,
        label: "Table Management",
        path: "/state/admin/table-management",
        allowedRoles: [1, 2, 6],
    },
    {
        icon: Percent,
        label: "Promotion",
        path: "/state/admin/promotion",
        allowedRoles: [1, 2, 3, 4, 6],
    },
    {
        icon: Users,
        label: "Customer Data",
        path: "/state/admin/customer-data",
        allowedRoles: [1, 2, 5, 6],
    },
    {
        icon: UserCog,
        label: "Roles Management",
        path: "/state/admin/roles-management",
        allowedRoles: [1], // super admin only
    },
    {
        icon: Settings,
        label: "Restaurant Settings",
        path: "/state/admin/restaurant-settings",
        allowedRoles: [1], // super admin only
    },
];


export default function Sidebar() {
const user = useAuthStore((state) => state.user);

    const [collapsed, setCollapsed] = useState(true);

    return (
        <aside
            className={`
        min-h-screen bg-[#F3F3F3] border-r border-gray-200
        transition-all duration-300
        ${collapsed ? "w-20" : "w-72"}
      `}
        >
            {/* Toggle */}
            <div className="flex justify-end p-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-md hover:bg-gray-200 bg-transparent"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Menu */}
            <nav className="px-3 space-y-2 mt-4">
                {menuItems
                    .filter((item) =>
                        user ? item.allowedRoles.includes(user.role) : false
                    )
                    .map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    `
        flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium
        transition
        ${isActive ? "bg-secondary" : "text-gray-700 hover:bg-gray-200"}
        ${collapsed ? "justify-center" : ""}
        `
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* ICON */}
                                        <Icon
                                            size={20}
                                            className={`
              shrink-0
              ${isActive ? "text-white" : "text-gray-600"}
            `}
                                        />

                                        {/* LABEL */}
                                        {!collapsed && (
                                            <span className={isActive ? "text-white" : "text-gray-700"}>
                                                {item.label}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

            </nav>
        </aside>
    );
}
