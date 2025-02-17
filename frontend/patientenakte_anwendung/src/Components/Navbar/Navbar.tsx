import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";

function Navbar() {

  const [account, setAccount] = useState(null);

  // Nutzer mit MetaMask verbinden
  const connectWallet = async () => {
      if (!window.ethereum) {
          alert("MetaMask nicht gefunden!");
          return;
      }
      try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]); // Speichert die Wallet-Adresse
      } catch (error) {
          console.error("Fehler beim Verbinden mit MetaMask:", error);
      }
  };

  
  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <h1>Patientenakte</h1>
      </div>
      <div className="navbar-links">
        <nav className="navbar">
        <div>
            {account ? (
                <p>Verbunden mit: {account}</p>
            ) : (
                <button onClick={connectWallet}>Mit MetaMask verbinden</button>
            )}
        </div>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/doctors">Ärzte</NavLink>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
