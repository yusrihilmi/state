import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useReservationStore } from "./stores/useReservationStore";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ReservationCalendar from "./pages/ReservationCalendar";
import DashboardSummary from "./pages/DashboardSummary";
import MenuManagement from "./pages/MenuManagement";
import BookingManagement from "./pages/BookingManagement";
import Promotion from "./pages/Promotion";
import RestaurantSettings from "./pages/RestaurantSettings";
import CustomerData from "./pages/CustomerData";
import TableManagement from "./pages/TableManagement";
import RolesManagement from "./pages/RolesManagement";
import UserManagement from "./pages/UserManagement";

import UserHomePage from "./pages/User/UserHomePage";
import UserReservationPage from "./pages/User/UserReservationPage";
import UserReservationGuestPage from "./pages/User/UserReservationGuestPage";
import UserReservationMenuPage from "./pages/User/UserReservationMenuPage";
import UserReservationCustomerPage from "./pages/User/UserReservationCustomerPage";
import UserReservationRequestPage from "./pages/User/UserReservationRequestPage";
import UserReservationConfirmationPage from "./pages/User/UserReservationConfirmationPage";
import UserReservationBookingConfirmPage from "./pages/User/UserReservationBookingConfirmPage";
import UserReservationBookingSearch from "./pages/User/UserReservationBookingSearch";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PrivateRoute({
  children,
  menuId,
}: {
  children: React.ReactNode;
  menuId: number;
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/state/office" replace />;
  }

  const hasAccess = user.access?.some(
    (item) => item.menu_id === menuId && item.no_access === false
  );

  if (!hasAccess) {
    // fallback redirect (prioritas menu 2 → 3)
    const canReservation = user.access?.some(
      (item) => item.menu_id === 2 && item.no_access === false
    );

    const canBooking = user.access?.some(
      (item) => item.menu_id === 3 && item.no_access === false
    );

    if (canReservation) {
      return <Navigate to="/state/office/reservation-calendar" replace />;
    }

    if (canBooking) {
      return <Navigate to="/state/office/booking-management" replace />;
    }

    return <Navigate to="/state/office" replace />;
  }

  return <>{children}</>;
}


const applyTenantTheme = (style: {
  primaryColor?: string;
  secondaryColor?: string;
  buttonHoverColor?: string;
}) => {
  const root = document.documentElement;

  if (style?.primaryColor)
    root.style.setProperty("--color-primary", style.primaryColor);

  if (style?.secondaryColor)
    root.style.setProperty("--color-secondary", style.secondaryColor);

  if (style?.buttonHoverColor)
    root.style.setProperty("--color-accent", style.buttonHoverColor);
};

export default function App() {

  // ✅ pindah ke dalam component
  const { data, fetchReservationStyle } = useReservationStore();

  useEffect(() => {
    if (!data) {
      fetchReservationStyle();
    } else {
      localStorage.setItem("layout", JSON.stringify(data));
    }
  }, [data]);



  // ✅ apply theme kalau data berubah
  useEffect(() => {
    if (data) {
      applyTenantTheme(data);
    }
  }, [data]);



  return (
    <Router>
      <ToastContainer position="top-right" autoClose={4000} />
      <Routes>
        {/* PUBLIC */}
        <Route path="/state/reservation" element={<UserHomePage />} />
        <Route path="/state/reservation/step-1" element={<UserReservationPage />} />
        <Route path="/state/reservation/step-2" element={<UserReservationGuestPage />} />
        <Route path="/state/reservation/step-3-order" element={<UserReservationMenuPage />} />
        <Route path="/state/reservation/step-4" element={<UserReservationCustomerPage />} />
        <Route path="/state/reservation/step-5-request" element={<UserReservationRequestPage />} />
        <Route path="/state/reservation/step-6" element={<UserReservationConfirmationPage />} />
        <Route path="/state/reservation/step-7" element={<UserReservationBookingConfirmPage />} />
        <Route path="/state/reservation/search" element={<UserReservationBookingSearch />} />

        <Route path="/state/office" element={<LoginPage />} />
        <Route path="/state/office/reset-password" element={<ResetPasswordPage />} />

        {/* PRIVATE */}
        <Route
          path="/state/office/dashboard-summary"
          element={
            <PrivateRoute menuId={1}>
              <DashboardSummary />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/reservation-calendar"
          element={
            <PrivateRoute menuId={2}>
              <ReservationCalendar />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/reservation-calendar/:bookingCode"
          element={
            <PrivateRoute menuId={2}>
              <ReservationCalendar />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/booking-management"
          element={
            <PrivateRoute menuId={3}>
              <BookingManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/menu-management"
          element={
            <PrivateRoute menuId={8}>
              <MenuManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/table-management"
          element={
            <PrivateRoute menuId={9}>
              <TableManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/promotion"
          element={
            <PrivateRoute menuId={10}>
              <Promotion />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/customer-data"
          element={
            <PrivateRoute menuId={12}>
              <CustomerData />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/roles-management"
          element={
            <PrivateRoute menuId={13}>
              <RolesManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/user-management"
          element={
            <PrivateRoute menuId={14}>
              <UserManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/office/restaurant-settings"
          element={
            <PrivateRoute menuId={15}>
              <RestaurantSettings />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="/" element={<Navigate to="/state/reservation" replace />} />
        <Route path="*" element={<Navigate to="/state/reservation" replace />} />
      </Routes>
    </Router>
  );
}
