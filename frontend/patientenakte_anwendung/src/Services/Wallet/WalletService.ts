import { getContract } from "../../contractConfig";

export const createWallet = async () => {
  try {
    const { contract } = await getContract("fabrikPatientenakte");
    if (!contract) return;
    const tx = await contract.createNewPatientenakte();
    await tx.wait();
    console.log(tx);
    alert("Patientenakte erstellt!");
  } catch (error) {
    console.error("Fehler beim Erstellen der Patientenakte:", error);
  }
};

export const checkWallet = async (): Promise<string | null> => {
  try {
    const { contract, signer } = await getContract("fabrikPatientenakte");
    if (!contract || !signer) {
      console.warn("Kein gültiger Vertrag oder Signer gefunden.");
      return null;
    }

    const patientenAdresse = await signer.getAddress();
    console.log("Wallet-Adresse: ", patientenAdresse);
    console.log("Contract-Adresse:", contract?.target);

    // Debug: Display available contract methods
    console.log(
      "Verfügbare Methoden:",
      contract.interface.fragments.map((f) => f.name)
    );

    try {
      const tx = await contract.getPatientenakte(patientenAdresse);

      if (!tx || tx === "0x0000000000000000000000000000000000000000") {
        console.warn("Keine Patientenakte gefunden.");
        return null;
      }

      console.log("Patientenakte-Adresse: ", tx);
      return tx; // ✅ Return the record address
    } catch (fetchError) {
      console.error("Fehler beim Abrufen der Patientenakte:", fetchError);
      return null;
    }
  } catch (error) {
    console.error("Fehler beim Überprüfen der Patientenakte:", error);
    return null;
  }
};

// Connect to MetaMask
export const connectWallet = async (
  setAccount: (account: string | null) => void
): Promise<void> => {
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
export const checkIfWalletIsConnected = async (
  setAccount: (account: string | null) => void
): Promise<void> => {
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
