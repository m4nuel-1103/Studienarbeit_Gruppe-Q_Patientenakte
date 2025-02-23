import { ethers } from "ethers";
import abiPatientenakte from "./Patientenakte.json"; // Stelle sicher, dass `resolveJsonModule` aktiviert ist
import abiFabrikPatientenakte from "./FabrikPatientenakte.json"; // Stelle sicher, dass `resolveJsonModule` aktiviert ist

// Adresse des Smart Contracts (ersetze mit der tatsächlichen Adresse)
const FABRIK_CONTRACT_ADDRESS: string = "0x262e2b50219620226C5fB5956432A88fffd94Ba7";

// Globales Fensterobjekt um `ethereum` zu typisieren
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

/**
 * Stellt eine Verbindung zu MetaMask her und gibt eine Instanz des Smart Contracts zurück.
 * @param contractName - Der Name des Smart Contracts, der geladen werden soll.
 * @returns {Promise<ethers.Contract | null>} - Eine Instanz des Contracts oder `null`, falls MetaMask nicht verfügbar ist.
 */
export const getContract = async (
  contractName: "patientenakte" | "fabrikPatientenakte"
): Promise<{contract: ethers.Contract | null; signer: ethers.Signer| null}> => {
  if (!window.ethereum) {
    alert("Bitte installiere MetaMask!");
    return {contract: null, signer: null};
  }

  try {
    // Verwende window.ethereum direkt als Eip1193Provider
    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    const signer = await provider.getSigner();
    console.log(" Signer Adresse:", await signer.getAddress()); // Debugging: Zeigt aktive Wallet-Adresse
    
    let contract: ethers.Contract;

    if(contractName === "fabrikPatientenakte") {
      contract = new ethers.Contract(FABRIK_CONTRACT_ADDRESS, abiFabrikPatientenakte.abi, signer);  
      return {contract, signer};
    }

    if (contractName === "patientenakte") {
      const fabrikContract = new ethers.Contract(FABRIK_CONTRACT_ADDRESS, abiFabrikPatientenakte.abi, signer);

      const userAddress = await signer.getAddress();
      const patientenakteAddress = await fabrikContract.getPatientenakte(userAddress);
      console.log("Patientenakte Adresse:", patientenakteAddress);

      if(!patientenakteAddress || patientenakteAddress === ethers.constants.AddressZero) {
        alert("Du hast noch keine Patientenakte erstellt!");
        //Hier später automatisch erstellen lassen
        return {contract: null, signer: null};
      }
      console.log("Patientenakte Adresse verifiziert:", patientenakteAddress);

      contract = new ethers.Contract(patientenakteAddress, abiPatientenakte.abi, signer);

      contract.on("AccessGranted", (doctor: bigint, docID: bigint, _expiresAt: bigint, _remainingUses: bigint, _expiresFlag: boolean, _usesFlag: boolean) => {
        console.log("Event ausgelöst!");
        console.log("Patient:", doctor);
        console.log("docID:", docID);
        console.log("_expiresAt:", _expiresAt);
        console.log("_remainingUses:", _remainingUses);
        console.log("_expiresFlag:", _expiresFlag);
        console.log("_usesFlag:", _usesFlag);
      });
      console.log("Erfolgreich Eventlistener hinzugefügt");



      return {contract, signer};



    }
  } catch (error) {
    console.error("Fehler beim Laden des Smart Contracts:", error);
    return {contract: null, signer: null};
  }
  return {contract: null, signer: null};
};
