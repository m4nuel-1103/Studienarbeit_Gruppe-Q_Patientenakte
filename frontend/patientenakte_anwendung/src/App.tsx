import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import AppRoutes from "./Services/AppRoutes";
import { useState } from "react";
//import { getContract } from "./contractConfig.ts";

function App() {

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
    <Router>
      <div className="app-container">
        <header className="header">
        <div>
            <h1>Dezentrale Patientenakte</h1>
            {account ? (
                <p>Verbunden mit: {account}</p>
            ) : (
                <button onClick={connectWallet}>Mit MetaMask verbinden</button>
            )}
        </div>
          <Navbar />
        </header>

        <div className="left-space">
          <div className="left-space-header"></div>
        </div>
        <main className="main-content">
          <AppRoutes />
        </main>
        <div className="right-space">
          <div className="right-space-header"></div>
        </div>

        {/* Footer */}
        <footer className="footer">Footer</footer>
      </div>
    </Router>
  );
}

export default App;
