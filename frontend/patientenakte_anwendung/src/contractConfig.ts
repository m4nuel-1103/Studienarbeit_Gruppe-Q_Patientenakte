import { ethers } from "ethers";
import abi from "./Patientenakte.json"; // Stelle sicher, dass `resolveJsonModule` aktiviert ist

// Adresse des Smart Contracts (ersetze mit der tatsächlichen Adresse)
const CONTRACT_ADDRESS: string = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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
export const getContract = async (): Promise<ethers.Contract | null> => {
  if (!window.ethereum) {
    alert("Bitte installiere MetaMask!");
    return null;
  }

  try {
    // Verwende window.ethereum direkt als Eip1193Provider
    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
  } catch (error) {
    console.error("Fehler beim Laden des Smart Contracts:", error);
    return null;
  }
};
