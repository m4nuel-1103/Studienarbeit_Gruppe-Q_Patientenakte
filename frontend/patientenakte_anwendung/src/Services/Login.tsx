

// Nutzer mit MetaMask verbinden
export const connectWallet = async () => {
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