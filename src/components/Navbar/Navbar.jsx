import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, logout } from "../../services/auth.service";
import { getSubscription } from "../../services/subscription.service";
import "./Navbar.css";

function NavigationIcon({ name }) {
  const common = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" };
  const paths = {
    companies: <><path d="M3 21h18M5 21V6l7-3 7 3v15M9 9h.01M15 9h.01M9 13h.01M15 13h.01M11 21v-4h2v4" /></>,
    fleets: <><path d="M12 3v17M7 8h10M8 21h8M7 13c0 3 2.2 5 5 5s5-2 5-5" /><path d="m7 13-3 3m3-3 3 3m7-3-3 3m3-3 3 3" /></>,
    ships: <><path d="M3 15h18l-2 4H6l-3-4Z" /><path d="M8 15V8h8v7M12 8V5" /><path d="M5 22c1 0 1.5-1 2.5-1S9 22 10 22s1.5-1 2.5-1 1.5 1 2.5 1 1.5-1 2.5-1 1.5 1 2.5 1" /></>,
    shipments: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3v4m8-4v4M8 14h3m-3 3h7" /></>,
    tracking: <><path d="M12 21s7-5.1 7-11A7 7 0 0 0 5 10c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    ports: <><path d="M4 20h16M6 20V8h12v12M9 8V4h6v4M9 12h.01m3-.01h.01m3 .01h.01M9 16h.01m3-.01h.01m3 .01h.01" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.6-3.3 2.4-5 5.5-5s4.9 1.7 5.5 5M16 10a2.5 2.5 0 1 0-1.2-4.7M16 15c2.4.1 3.9 1.8 4.5 5" /></>,
    dashboard: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 20v-6h6v6h-6Z" /></>,
    subscription: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    documents: <><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M9 13h6m-6 4h6" /></>,
  };
  return <svg className="nav-icon" {...common}>{paths[name] || paths.dashboard}</svg>;
}

function Navbar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [subscriptionAccess, setSubscriptionAccess] = useState(null);

  useEffect(() => {
    if (user?.role !== "COMPANY_ADMIN") return undefined;
    let current = true;
    getSubscription().then(({ plan, status, endsAt }) => {
      const validUntil = endsAt && new Date(endsAt) > new Date();
      const paid = plan === "PREMIUM" && (status === "ACTIVE" || (status === "CANCELED" && validUntil));
      const trial = plan === "TRIAL" && status === "TRIALING" && validUntil;
      if (current) setSubscriptionAccess(Boolean(paid || trial));
    }).catch(() => { if (current) setSubscriptionAccess(false); });
    return () => { current = false; };
  }, [location.key, user?.role]);

  const hasWorkspaceAccess = user?.role !== "COMPANY_ADMIN" || subscriptionAccess === true;
  const links = user?.role === "CUSTOMER"
    ? [["/shipments", "My Shipments", "shipments"], ["/documents", "Documents", "documents"], ["/dashboard", "Customer Dashboard", "dashboard"]]
    : user?.role === "FLEET_MANAGER"
      ? [["/fleets", "Fleets", "fleets"], ["/ships", "Ships", "ships"], ["/shipments", "Shipments", "shipments"], ["/tracking", "Tracking", "tracking"], ["/ports", "Ports", "ports"], ["/dashboard", "Dashboard", "dashboard"], ["/documents", "Documents", "documents"]]
      : [["/companies", "Companies", "companies"], ["/fleets", "Fleets", "fleets"], ["/ships", "Ships", "ships"], ["/shipments", "Shipments", "shipments"], ["/tracking", "Tracking", "tracking"], ["/ports", "Ports", "ports"], ["/users", "Users", "users"], ["/dashboard", "Dashboard", "dashboard"], ...(user?.role === "COMPANY_ADMIN" ? [["/subscription", "Subscription", "subscription"]] : []), ["/documents", "Documents", "documents"]];
  const closeMobileMenu = () => {
    if (window.matchMedia("(max-width: 900px)").matches && collapsed) onToggle();
  };
  const handleSidebarClick = (event) => { if (!event.target.closest("a, button")) onToggle(); };
  const handleLogout = async () => {
    try { await logout(); navigate("/login"); } catch (error) { console.error("Logout failed:", error); }
  };

  return <aside className={`navbar${collapsed ? " is-collapsed" : ""}`} onClick={handleSidebarClick}>
    <nav className="navbar-content" aria-label="Main navigation">
      <button type="button" className="brand" onClick={onToggle} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed}>
        <span className="brand-mark" aria-hidden="true">⚓</span><span className="brand-text">ShipOps</span>
      </button>
      <div className="nav-links">
        {hasWorkspaceAccess && links.map(([to, label, icon]) => <NavLink key={to} to={to} onClick={closeMobileMenu} title={collapsed ? label : undefined}><NavigationIcon name={icon} /><span className="nav-link-label">{label}</span></NavLink>)}
        {user?.role === "COMPANY_ADMIN" && !hasWorkspaceAccess && <NavLink to="/subscription" onClick={closeMobileMenu} title={collapsed ? "Subscription" : undefined}><NavigationIcon name="subscription" /><span className="nav-link-label">Subscription</span></NavLink>}
      </div>
      <div className="nav-user">
        {user && <><div className="user-context"><span className="user-name">{user.name}</span><span className="user-role">{user.role.replaceAll("_", " ")}</span></div><button className="logout-btn" onClick={handleLogout} title="Logout">Logout</button></>}
      </div>
    </nav>
  </aside>;
}

export default Navbar;
