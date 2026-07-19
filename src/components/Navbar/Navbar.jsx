import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout, getUser } from "../../services/auth.service";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage whenever route changes
    const currentUser = getUser();
    setUser(currentUser);
  }, [location]); // Re-run when location changes

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
        <NavLink to="/companies" className="brand">
          ShipOps
        </NavLink>
        <div className="nav-links">
          <NavLink to="/companies">Companies</NavLink>
          <NavLink to="/fleets">Fleets</NavLink>
          <NavLink to="/ships">Ships</NavLink>
          <NavLink to="/shipments">Shipments</NavLink>

        </div>
        <div className="nav-user">
          {user && (
            <>
              <span className="user-name">{user.name}</span>
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
