import { ethers } from "ethers";
import abi from "./Patientenakte.json"; // Stelle sicher, dass `resolveJsonModule` aktiviert ist

// Adresse des Smart Contracts (ersetze mit der tatsächlichen Adresse)
const CONTRACT_ADDRESS: string = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Globales Fensterobjekt um `ethereum` zu typisieren
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

/**
 * Stellt eine Verbindung zu MetaMask her und gibt eine Instanz des Smart Contracts zurück.
 * @returns {Promise<ethers.Contract | null>} - Eine Instanz des Contracts oder `null`, falls MetaMask nicht verfügbar ist.
 */
export const getContract = async (): Promise<{contract: ethers.Contract | null; signer: ethers.Signer| null}> => {
  if (!window.ethereum) {
    alert("Bitte installiere MetaMask!");
    return {contract: null, signer: null};
  }

  try {
    // Verwende window.ethereum direkt als Eip1193Provider
    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    const signer = await provider.getSigner();
    console.log(" Signer Adresse:", await signer.getAddress()); // Debugging: Zeigt aktive Wallet-Adresse
    console.log(" Signer Objekt:", signer); // Prüft, ob Signer korrekt ist
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
    return {contract, signer};
  } catch (error) {
    console.error("Fehler beim Laden des Smart Contracts:", error);
    return {contract: null, signer: null};
  }
};
