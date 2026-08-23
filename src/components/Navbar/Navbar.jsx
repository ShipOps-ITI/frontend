import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, logout } from "../../services/auth.service";
import { getSubscription } from "../../services/subscription.service";
import "./Navbar.css";

function Navbar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [subscriptionAccess, setSubscriptionAccess] = useState(null);

  useEffect(() => {
    if (user?.role !== "COMPANY_ADMIN") return undefined;

    let current = true;
    getSubscription()
      .then(({ plan, status, endsAt }) => {
        const stillPaid = plan === "PREMIUM" && (status === "ACTIVE" || (status === "CANCELED" && endsAt && new Date(endsAt) > new Date()));
        const trialActive = plan === "TRIAL" && status === "TRIALING" && endsAt && new Date(endsAt) > new Date();
        if (current) setSubscriptionAccess(Boolean(stillPaid || trialActive));
      })
      .catch(() => { if (current) setSubscriptionAccess(false); });

    return () => { current = false; };
  }, [location.key, user?.role]);

  const hasWorkspaceAccess = user?.role !== "COMPANY_ADMIN" || subscriptionAccess === true;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className={`navbar${collapsed ? " is-collapsed" : ""}`}>
      <nav className="navbar-content" aria-label="Main navigation">
        <NavLink to={user?.role === "COMPANY_ADMIN" && !hasWorkspaceAccess ? "/subscription" : "/dashboard"} className="brand"><span className="brand-mark" aria-hidden="true">⚓</span>ShipOps</NavLink>
        <div className="sidebar-controls">
          <button
            className="sidebar-toggle"
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <div className="nav-links">
          {hasWorkspaceAccess && ["ADMIN", "COMPANY_ADMIN"].includes(user?.role) && <>
            <NavLink to="/companies">Companies</NavLink><NavLink to="/fleets">Fleets</NavLink>
            <NavLink to="/ships">Ships</NavLink><NavLink to="/shipments">Shipments</NavLink>
            <NavLink to="/tracking">Tracking</NavLink><NavLink to="/ports">Ports</NavLink><NavLink to="/users">Users</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            {user?.role === "COMPANY_ADMIN" && <NavLink to="/subscription">Subscription</NavLink>}

          </>}
          {hasWorkspaceAccess && user?.role === "FLEET_MANAGER" && <>
            <NavLink to="/fleets">Fleets</NavLink><NavLink to="/ships">Ships</NavLink>
            <NavLink to="/shipments">Shipments</NavLink><NavLink to="/tracking">Tracking</NavLink><NavLink to="/ports">Ports</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>

          </>}
          {hasWorkspaceAccess && user?.role === "CUSTOMER" && <>
            <NavLink to="/shipments">My Shipments</NavLink>
            <NavLink to="/dashboard">Customer Dashboard</NavLink>

          </>}
          {hasWorkspaceAccess && user?.role !== "CUSTOMER" && <NavLink to="/documents">Documents</NavLink>}
          {user?.role === "COMPANY_ADMIN" && !hasWorkspaceAccess && <NavLink to="/subscription">Subscription</NavLink>}
        </div>
        <div className="nav-user">
          {user && <><div className="user-context"><span className="user-name">{user.name}</span><span className="user-role">{user.role.replaceAll("_", " ")}</span></div><button className="logout-btn" onClick={handleLogout} title="Logout">Logout</button></>}
        </div>
      </nav>
    </aside>
  );
}

export default Navbar;
