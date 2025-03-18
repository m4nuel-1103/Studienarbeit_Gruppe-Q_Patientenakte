import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import DoctorRoutes from "./Services/DoctorRoutes";
import PatientRoutes from "./Services/PatientRoutes";
import { useEffect, useState } from "react";
import {
    checkWallet,
    createWallet,
    checkIfWalletIsConnected,
} from "./Services/Wallet/WalletService";


const App = () => {
    const [isDoc, setIsDoc] = useState<boolean>(() => {
        // Beim ersten Laden den Wert aus localStorage abrufen
        const storedRole = localStorage.getItem("isDoc");
        return storedRole ? JSON.parse(storedRole) : false; // Falls kein Wert vorhanden ist, default auf `false`
    });
    const [account, setAccount] = useState<string | null>(null); // Wallet address

    const toggleRole = () => {
        setIsDoc((prev) => {
            const newRole = !prev;
            localStorage.setItem("isDoc", JSON.stringify(newRole)); // Wert in localStorage speichern
            return newRole;
        });
    };

    // Listen for account changes
    useEffect(() => {
        checkIfWalletIsConnected(setAccount);

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
                            {isDoc ? <DoctorRoutes address={account} /> : <PatientRoutes patientAddress={account} />}
                        </main>

                        <div className="right-space">
                            <div className="right-space-header"></div>
                        </div>
                    </>
                ) : (
                    <div className="login-container">
                        <h1>Patientenakte</h1>
                        <h2 className="">Bitte mit MetaMask verbinden, um fortzufahren</h2>
                        <button
                            onClick={async () => {
                                try {
                                    const patientenakte = await checkWallet();
                                    if (!patientenakte) {
                                        if (
                                            window.confirm(
                                                "Möchtest du eine neue Patientenakte erstellen?"
                                            )
                                        ) {
                                            await createWallet();
                                        }
                                    } else {
                                        setAccount(patientenakte);
                                        console.log("Patientenakte gefunden:", patientenakte);
                                    }
                                } catch (error) {
                                    console.error("Fehler beim Verbinden mit MetaMask:", error);
                                    alert(
                                        "Verbindung mit MetaMask fehlgeschlagen. Bitte versuchen Sie es erneut."
                                    );
                                }
                            }}
                            className=""
                        >
                            Mit MetaMask verbinden
                        </button>
                    </div>
                )}
            </div>
        </Router>
    );
};

export default App;
