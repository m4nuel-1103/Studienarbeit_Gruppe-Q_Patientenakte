import "./Navbar.css";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <h1>Patientenakte</h1>
      </div>
      <div className="navbar-links">
        <nav className="navbar">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/doctors">Ärzte</NavLink>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
