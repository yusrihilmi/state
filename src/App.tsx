import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useReservationStore } from "./stores/useReservationStore";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import LoginPage from "./pages/LoginPage";
import ReservationCalendar from "./pages/ReservationCalendar";
import DashboardSummary from "./pages/DashboardSummary";
import MenuManagement from "./pages/MenuManagement";
import BookingManagement from "./pages/BookingManagement";
import Promotion from "./pages/Promotion";
import RestaurantSettings from "./pages/RestaurantSettings";
import CustomerData from "./pages/CustomerData";
import TableManagement from "./pages/TableManagement";
import RolesManagement from "./pages/RolesManagement";

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
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: number[];
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/state/admin" replace />;
  }

  // kalau ada allowedRoles → cek role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if ([1, 2, 3, 6].includes(user.role)) {
      return <Navigate to="/state/admin/reservation-calendar" replace />;
    }

    if ([4, 5].includes(user.role)) {
      return <Navigate to="/state/admin/booking-management" replace />;
    }

    return <Navigate to="/state/admin" replace />;
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

        <Route path="/state/admin" element={<LoginPage />} />

        {/* PRIVATE */}
        <Route
          path="/state/admin/dashboard-summary"
          element={
            <PrivateRoute allowedRoles={[1, 2, 6]}>
              <DashboardSummary />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/reservation-calendar"
          element={
            <PrivateRoute allowedRoles={[1, 2, 3, 6]}>
              <ReservationCalendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/reservation-calendar/:bookingCode"
          element={
            <PrivateRoute allowedRoles={[1, 2, 3, 6]}>
              <ReservationCalendar />
            </PrivateRoute>
          }
        />

        <Route
          path="/state/admin/booking-management"
          element={
            <PrivateRoute allowedRoles={[1, 2, 3, 4, 5, 6]}>
              <BookingManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/menu-management"
          element={
            <PrivateRoute allowedRoles={[1, 2, 6]}>
              <MenuManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/table-management"
          element={
            <PrivateRoute allowedRoles={[1, 2, 6]}>
              <TableManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/promotion"
          element={
            <PrivateRoute allowedRoles={[1, 2, 3, 4, 6]}>
              <Promotion />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/restaurant-settings"
          element={
            <PrivateRoute allowedRoles={[1]}>
              <RestaurantSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/customer-data"
          element={
            <PrivateRoute allowedRoles={[1, 2, 5, 6]}>
              <CustomerData />
            </PrivateRoute>
          }
        />
        <Route
          path="/state/admin/roles-management"
          element={
            <PrivateRoute allowedRoles={[1]}>
              <RolesManagement />
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
