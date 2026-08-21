import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, logout } from "../../services/auth.service";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="navbar">
      <nav className="navbar-content" aria-label="Main navigation">
        <NavLink to="/dashboard" className="brand">ShipOps</NavLink>
        <div className="nav-links">
          {["ADMIN", "COMPANY_ADMIN"].includes(user?.role) && <>
            <NavLink to="/companies">Companies</NavLink><NavLink to="/fleets">Fleets</NavLink>
            <NavLink to="/ships">Ships</NavLink><NavLink to="/shipments">Shipments</NavLink>
            <NavLink to="/tracking">Tracking</NavLink><NavLink to="/ports">Ports</NavLink><NavLink to="/users">Users</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </>}
          {user?.role === "FLEET_MANAGER" && <>
            <NavLink to="/fleets">Fleets</NavLink><NavLink to="/ships">Ships</NavLink>
            <NavLink to="/shipments">Shipments</NavLink><NavLink to="/tracking">Tracking</NavLink><NavLink to="/ports">Ports</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </>}
          {user?.role === "CUSTOMER" && <>
            <NavLink to="/shipments">My Shipments</NavLink><NavLink to="/documents">Documents</NavLink>
            <NavLink to="/dashboard">Customer Dashboard</NavLink>
          </>}
          {user?.role !== "CUSTOMER" && <NavLink to="/documents">Documents</NavLink>}
        </div>
        <div className="nav-user">
          {user && <><span className="user-name">{user.name}</span><button className="logout-btn" onClick={handleLogout} title="Logout">Logout</button></>}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
