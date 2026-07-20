import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/auth.service";

export function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  return isAuthenticated() ? <Navigate to="/companies" replace /> : <Outlet />;
}
