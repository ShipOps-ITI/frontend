import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUser } from "../services/auth.service";

export function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export function AdminRoute() {
  const user = getUser();
  return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export function OperationsRoute() {
  const user = getUser();
  return ["ADMIN", "FLEET_MANAGER"].includes(user?.role)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}
