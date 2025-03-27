import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";

interface NavbarProps {
  toggleRole: () => void;
  isDoc: boolean;
  account: string | null;
  setAccount: (account: string | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleRole, isDoc, account, setAccount }) => {
  const navigate = useNavigate();
  const prevAccountRef = useRef<string | null>(null);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary-color",
      isDoc ? "var(--primary-color-d)" : "var(--primary-color-p)"
    );
  }, [isDoc]);

  const handleManualDisconnect = () => {
    setAccount(null); // Manuelles Trennen
  };

  const handleAutoDisconnect = useCallback(() => {
    console.log("Account wurde gewechselt oder getrennt.");
    setAccount(null);
    navigate("/");
  }, [navigate, setAccount]);
  
  
  // Automatischer Logout bei MetaMask Account-Wechsel
  useEffect(() => {
    if (prevAccountRef.current && account && prevAccountRef.current !== account) {
      handleAutoDisconnect();
    }
    prevAccountRef.current = account;
  }, [account, handleAutoDisconnect]);
  

  return (    
    <div className={`navbar-container ${isDoc ? "doc" : ""}`}>
      <div className="navbar-logo">
        <h1>Patientenakte</h1>
        <div>
          <p>
            {account}
          </p>
        <button
              onClick={handleManualDisconnect}
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
