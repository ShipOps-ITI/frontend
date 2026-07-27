import { Navigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../../services/auth.service";

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Get user from localStorage
  const user = getUser();

  // Check if user has ADMIN role
  if (user?.role !== "ADMIN") {
    return <Navigate to="/companies" replace />;
  }

  // Render children if authenticated and is ADMIN
  return children;
};

export default ProtectedRoute;
