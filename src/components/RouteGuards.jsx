import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUser } from "../services/auth.service";
import { getSubscription } from "../services/subscription.service";

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

export function CompanyAdminRoute() {
  const user = getUser();
  return ["ADMIN", "COMPANY_ADMIN"].includes(user?.role)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}

export function OperationsRoute() {
  const user = getUser();
  return ["ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"].includes(user?.role)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}

export function CompanyOnboardingGate() {
  const user = getUser();
  return user?.role === "COMPANY_ADMIN" && !user?.companyId
    ? <Navigate to="/onboarding/company" replace />
    : <Outlet />;
}

export function DocumentAccessRoute() {
  const user = getUser();
  return ["ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"].includes(user?.role)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}

export function SubscriptionGate() {
  const user = getUser();
  const requiresSubscription = user?.role === "COMPANY_ADMIN";
  const [state, setState] = useState({ loading: true, hasAccess: false, error: "" });

  useEffect(() => {
    if (!requiresSubscription) return undefined;

    getSubscription()
      .then(({ plan, status, endsAt }) => {
        const paidThroughDate = endsAt && new Date(endsAt).getTime() > Date.now();
        const paidPlan = plan === "PREMIUM" && (status === "ACTIVE" || (status === "CANCELED" && paidThroughDate));
        const trial = plan === "TRIAL" && status === "TRIALING" && paidThroughDate;
        setState({ loading: false, hasAccess: Boolean(paidPlan || trial), error: "" });
      })
      .catch(() => setState({ loading: false, hasAccess: false, error: "Unable to verify your subscription." }));
    return undefined;
  }, [requiresSubscription]);

  if (!requiresSubscription) return <Outlet />;
  if (state.loading) return <main className="route-status">Checking workspace access...</main>;
  if (state.error) return <Navigate to="/subscription" replace />;
  return state.hasAccess ? <Outlet /> : <Navigate to="/subscription" replace />;
}
