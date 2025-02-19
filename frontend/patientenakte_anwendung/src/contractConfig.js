import { ethers } from "ethers";

// Adresse des deployed Smart Contracts (ändere sie mit deiner Adresse!)
const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// ABI (die Schnittstelle deines Smart Contracts)
import abi from "./Patientenakte.json"; // Erstelle eine Datei mit dem ABI deines Contracts

// Verbindung zu MetaMask und Laden des Contracts
export const getContract = async () => {
    if (!window.ethereum) {
        alert("Bitte installiere MetaMask!");
        return null;
    }
    console.log(abi);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log(signer);
    return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
};
