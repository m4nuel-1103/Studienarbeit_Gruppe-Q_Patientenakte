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

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { ethers } from "ethers";
import { decryptToString } from '@lit-protocol/encryption';
import { LIT_ABILITY } from "@lit-protocol/constants";
import {
    LitAccessControlConditionResource,
    createSiweMessageWithRecaps,
    generateAuthSig,
} from "@lit-protocol/auth-helpers";


const App = () => {
    const [isDoc, setIsDoc] = useState(false); // Default role: Patient
    const [account, setAccount] = useState<string | null>(null); // Wallet address

    // Toggle between Doctor and Patient roles
    const toggleRole = () => {
        setIsDoc(!isDoc);
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

    //     return (
    //         <Router>
    //             <div className="app-container">
    //                 {account ? (
    //                     <>
    //                         <header className="header">
    //                             {/* Pass wallet and role props to Navbar */}
    //                             <Navbar
    //                                 toggleRole={toggleRole}
    //                                 isDoc={isDoc}
    //                                 account={account}
    //                                 setAccount={setAccount}
    //                             />
    //                         </header>
    //
    //                         <div className="left-space">
    //                             <div className="left-space-header"></div>
    //                         </div>
    //
    //                         <main className="main-content">
    //                             {/* Switch routes dynamically */}
    //                             {isDoc ? <DoctorRoutes /> : <PatientRoutes patientAddress={account} />}
    //                         </main>
    //
    //                         <div className="right-space">
    //                             <div className="right-space-header"></div>
    //                         </div>
    //
    //                         {/* Footer */}
    //                         <footer className="footer">Footer</footer>
    //                     </>
    //                 ) : (
    //                     <div className="login-container">
    //                         <h2 className="text-2xl mb-4">Bitte mit MetaMask verbinden, um fortzufahren</h2>
    //                         <button
    //                             onClick={connectWallet}
    //                             className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    //                         >
    //                             Mit MetaMask verbinden
    //                         </button>
    //                         <button //Hier hab ich dir mal wieder reingepfuscht SORRY
    //                             onClick={createWallet}
    //                             className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    //                         >
    //                             Erstelle Wallet
    //                         </button>
    //                     </div>
    //                 )}
    //             </div>
    //         </>
    //     ) : (
    //         <div className="login-container">
    //             <h1>Patientenakte</h1>
    //             <h2 className="">Bitte mit MetaMask verbinden, um fortzufahren</h2>
    //             <button
    //                 onClick={async () => {
    //                     try {
    //                         const patientenakte = await checkWallet();
    //                         if (!patientenakte) {
    //                             // If no patient record exists, prompt the user to create one
    //                             if (
    //                                 window.confirm(
    //                                     "Möchtest du eine neue Patientenakte erstellen?"
    //                                 )
    //                             ) {
    //                                 await createWallet();
    //                             }
    //                         } else {
    //                             setAccount(patientenakte);
    //                             console.log("Patientenakte gefunden:", patientenakte);
    //                         }
    //                     } catch (error) {
    //                         console.error("Fehler beim Verbinden mit MetaMask:", error);
    //                         alert(
    //                             "Verbindung mit MetaMask fehlgeschlagen. Bitte versuchen Sie es erneut."
    //                         );
    //                     }
    //                 }}
    //                 className=""
    //             >
    //                 Mit MetaMask verbinden
    //             </button>
    //         </div>
    //     )
    // }
    //       </div >
    //     {/* Footer */ }
    //     < footer className = "footer" > Footer</footer >
    //     </Router >
    //   );
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
                                        // If no patient record exists, prompt the user to create one
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
            {/* Footer */}
            <footer className="footer">Footer</footer>
        </Router>
    );
};

export default App;
