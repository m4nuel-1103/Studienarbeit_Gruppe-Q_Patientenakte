import { useEffect, useState } from "react";
import "../../Styles/DoctorsDetails.css";
import { documents } from '../../db/schema';
import { encrypt } from '@metamask/eth-sig-util';

type AddressProps = {
  patientAddress: string;
};

async function encryptAndUploadPDF(address: string, fileContents: string, fileName: string) {
  const pubKey = await window.ethereum!.request({
    method: "eth_getEncryptionPublicKey",
    params: [address]
  });
  const fileEncrypted = JSON.stringify(encrypt({
    data: fileContents,
    publicKey: pubKey,
    version: "x25519-xsalsa20-poly1305",
  }));
  const fileNameEncrypted = JSON.stringify(encrypt({
    data: fileName,
    publicKey: pubKey,
    version: "x25519-xsalsa20-poly1305",
  }));
  const docUpload: typeof documents.$inferInsert = {
    patientAddress: address,
    name: fileNameEncrypted,
    content: fileEncrypted
  };
  const resp = await fetch("/api/documents", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(docUpload),
  }).then((b) => { console.log(b); return b.json(); });
  console.log("file-upload: ", resp);
}

function PatientHome(props: AddressProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewURL(URL.createObjectURL(selectedFile)); // PDF-Vorschau generieren
    } else {
      alert("Bitte eine gültige PDF-Datei auswählen!");
    }
  };

  // Datei hochladen (noch ohne Speicherung)
  const handleUpload = async () => {
    if (!file) {
      alert("Bitte zuerst eine Datei auswählen!");
      return;
    }
    await encryptAndUploadPDF(props.patientAddress, await file.text(), file.name);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>PDF Hochladen</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {previewURL && (
        <div>
          <p>Vorschau:</p>
          <iframe src={previewURL} width="100%" height="400px" title="PDF Vorschau"></iframe>
        </div>
      )}
      <button onClick={handleUpload} style={{ marginTop: 10 }}>Hochladen</button>
    </div>
  );
};


export default PatientHome;
