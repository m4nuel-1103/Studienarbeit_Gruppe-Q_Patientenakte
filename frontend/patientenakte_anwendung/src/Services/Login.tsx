import { useState } from "react";

interface LoginProps {
  setAccount: (account: string) => void;
}

const Login: React.FC<LoginProps> = ({ setAccount }) => {
  const [localAccount, setLocalAccount] = useState<string | null>(null);

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
      setLocalAccount(accounts[0]);
      setAccount(accounts[0]); // Update global account state
    } catch (error) {
      console.error("Fehler beim Verbinden mit MetaMask:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-center">
      {!localAccount ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Wallet verbinden
        </button>
      ) : (
        <p className="mt-2">Verbunden mit: {localAccount}</p>
      )}
    </div>
  );
};

export default Login;
