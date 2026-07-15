import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
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
      </nav>
    </header>
  );
}

export default Navbar;
