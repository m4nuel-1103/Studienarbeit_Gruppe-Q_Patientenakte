import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import DoctorRoutes from "./Services/DoctorRoutes";
import PatientRoutes from "./Services/PatientRoutes";
import { useEffect, useState } from "react";
import { getContract } from "./contractConfig";

const App = () => {
  const [isDoc, setIsDoc] = useState(false); // Default role: Patient
  const [account, setAccount] = useState<string | null>(null); // Wallet address

  // Toggle between Doctor and Patient roles
  const toggleRole = () => {
    setIsDoc(!isDoc);
  };

  //CreateWallet später wo anders hin
  const createWallet = async () => {
try {
            const {contract,signer} = await getContract("fabrikPatientenakte"); //signer falls man ihn mal braucht
            console.log(signer);
            console.log(contract);
            if(!contract) return;
            const tx = await contract.createNewPatientenakte();
            await tx.wait();
            console.log(tx);
            alert("Patientenakte erstellt!");
            console.log("Patientenakte erstellt!", tx.to);
  }
  catch (error) {
    console.error("Fehler beim ERstellen der Patientenakte:", error);
  }
}

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask nicht gefunden!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]); // Save wallet address
      console.log("Wallet verbunden:", accounts[0]);
    } catch (error) {
      console.error("Fehler beim Verbinden mit MetaMask:", error);
    }
  };

  // Automatically update account on wallet change
  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Fehler beim Überprüfen der Wallet-Verbindung:", error);
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.ethereum as any).on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]); // Update account on change
        } else {
          setAccount(null); // Clear account if disconnected
        }
      });
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        {account ? (
          <>
            <header className="header">
              {/* Pass wallet and role props to Navbar */}
              <Navbar
                toggleRole={toggleRole}
                isDoc={isDoc}
                account={account}
                setAccount={setAccount}
              />
            </header>

            <div className="left-space">
              <div className="left-space-header"></div>
            </div>

            <main className="main-content">
              {/* Switch routes dynamically */}
              {isDoc ? <DoctorRoutes /> : <PatientRoutes />}
            </main>

            <div className="right-space">
              <div className="right-space-header"></div>
            </div>

            {/* Footer */}
            <footer className="footer">Footer</footer>
          </>
        ) : (
          <div className="login-container">
            <h2 className="text-2xl mb-4">Bitte mit MetaMask verbinden, um fortzufahren</h2>
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Mit MetaMask verbinden
            </button>
            <button //Hier hab ich dir mal wieder reingepfuscht SORRY
              onClick={createWallet}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Erstelle Wallet
            </button>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
