import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";

interface NavbarProps {
  toggleRole: () => void;
  isDoc: boolean;
  account: string | null;
  setAccount: (account: string | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleRole, isDoc, account, setAccount }) => {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary-color",
      isDoc ? "var(--primary-color-d)" : "var(--primary-color-p)"
    );
  }, [isDoc]);

  const disconnectWallet = () => {
    setAccount(null); 
    console.log("Wallet erfolgreich getrennt");
  };

  return (
    <div className={`navbar-container ${isDoc ? "doc" : ""}`}>
      <div className="navbar-logo">
        <h1>Patientenakte</h1>
        <div>
          <p>
            {account}
          </p>
        <button
              onClick={disconnectWallet}
              className="disconnect-button"
              >
              Trennen
            </button>
        </div>
      </div>
      <div className="navbar-links">
        <nav className="navbar">
          <div className="role-switch-container">
            <span className="role-label">Patient</span>
            <label className="switch">
              <input type="checkbox" checked={isDoc} onChange={toggleRole} />
              <span className="slider round"></span>
            </label>
            <span className="role-label">Arzt</span>
          </div>

          <NavLink to="/">Home</NavLink>
          {isDoc ? (
            <NavLink to="/patients">Patienten</NavLink>
          ) : (
            <NavLink to="/doctors">Ärzte</NavLink>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
