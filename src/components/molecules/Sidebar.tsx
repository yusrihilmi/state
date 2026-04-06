import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { Menu, LayoutDashboard, CalendarDays, Album, HandPlatter, Utensils, Percent, Settings, Users, UserCog, Settings2 } from "lucide-react";

const menuItems = [
    {
        icon: LayoutDashboard,
        label: "Dashboard Summary",
        path: "/state/office/dashboard-summary",
        menuId: 1,
    },
    {
        icon: CalendarDays,
        label: "Reservation Calendar",
        path: "/state/office/reservation-calendar",
        menuId: 2,
    },
    {
        icon: Album,
        label: "Booking Management",
        path: "/state/office/booking-management",
        menuId: 3,
    },
    {
        icon: Utensils,
        label: "Menu Management",
        path: "/state/office/menu-management",
        menuId: 8,
    },
    {
        icon: HandPlatter,
        label: "Table Management",
        path: "/state/office/table-management",
        menuId: 9,
    },
    {
        icon: Percent,
        label: "Promotion",
        path: "/state/office/promotion",
        menuId: 10,
    },
    {
        icon: Users,
        label: "Customer Data",
        path: "/state/office/customer-data",
        menuId: 12,
    },
    {
        icon: UserCog,
        label: "User Management",
        path: "/state/office/user-management",
        menuId: 14,
    },
    {
        icon: Settings2,
        label: "Roles Management",
        path: "/state/office/roles-management",
        menuId: 13,
    },
    {
        icon: Settings,
        label: "Restaurant Settings",
        path: "/state/office/restaurant-settings",
        menuId: 15,
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
                        user?.access?.some(
                            (acc) =>
                                acc.menu_id === item.menuId && acc.no_access === false
                        )
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
