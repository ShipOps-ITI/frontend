import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../../services/auth.service";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="navbar">
      <nav className="navbar-content" aria-label="Main navigation">
        <NavLink to="/companies" className="brand">
          ShipOps
        </NavLink>
        <div className="nav-links">
          <NavLink to="/companies">Companies</NavLink>
          <NavLink to="/fleets">Fleets</NavLink>
          <NavLink to="/ships">Ships</NavLink>
          <NavLink to="/shipments">Shipments</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {["ADMIN", "FLEET_MANAGER"].includes(user?.role) && <NavLink to="/ports">Ports</NavLink>}
          <NavLink to="/documents">Documents</NavLink>
          {user?.role === "ADMIN" && <NavLink to="/users">Users</NavLink>}

        </div>
        <div className="nav-user">
          {user && (
            <>
              <div className="user-context">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role.replaceAll("_", " ")}</span>
              </div>
              <button 
                className="logout-btn" 
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
