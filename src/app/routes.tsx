import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/Dashboard";
import { Orders } from "./components/Orders";
import { OrderDetail } from "./components/OrderDetail";
import { NewOrder } from "./components/NewOrder"; 
import { Employees } from "./components/Employees";
import { Attendance } from "./components/Attendance";
import { Reports } from "./components/Reports";
import { Profile } from "./components/Profile"; // Tambahkan Import Profile
import { Login } from "./components/Login";
import { Salary } from "./components/Salary"; 
import { useAuthStore } from "./store";
import { Notifications } from './components/Notifications';
import { Security } from './components/Security';
import { HelpCenter } from './components/HelpCenter';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: ('admin' | 'karyawan')[] }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? "/" : "/attendance"} replace />;
  }
  return <Outlet />;
};

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      // RUTE KHUSUS ADMIN
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "orders", element: <Orders /> },
          { path: "orders/new", element: <NewOrder /> },
          { path: "orders/:id", element: <OrderDetail /> },
          { path: "orders/:id/edit", element: <OrderDetail /> },
          { path: "employees", element: <Employees /> },
          { path: "reports", element: <Reports /> },
          { path: "salary", element: <Salary /> }, 
        ],
      },
      // RUTE YANG BISA DIAKSES ADMIN & KARYAWAN
      {
        element: <ProtectedRoute allowedRoles={['admin', 'karyawan']} />,
        children: [
          { path: "attendance", element: <Attendance /> },
          { path: "profile", element: <Profile /> }, 
           { path: "profile/notifications", element: <Notifications /> },
          { path: "profile/security", element: <Security /> },
          { path: "profile/help", element: <HelpCenter /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> }
    ],
  },
]);