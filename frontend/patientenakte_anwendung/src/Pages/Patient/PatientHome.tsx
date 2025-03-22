import { useEffect, useState } from "react";
import "../../Styles/DoctorsDetails.css";
import { documents } from '../../db/schema';
import { encrypt } from '@metamask/eth-sig-util';

type AddressProps = {
    patientAddress: string;
};

function encBase64(s: ArrayBuffer) {
    const u8b = new Uint8Array(s);
    const binString = Array.from(u8b, (b) => String.fromCodePoint(b)).join("");
    const ret = btoa(binString);
    return ret;
}

async function encryptAndUploadPDF(address: string, fileContents: Uint8Array, fileName: string) {
    // const encoder = new TextEncoder();
    console.log(fileContents.length);
    const fileConBase64 = encBase64(fileContents);
    console.log(fileConBase64.length)
    // console.log(fileConBase64)
    const pubKey = await window.ethereum!.request({
        method: "eth_getEncryptionPublicKey",
        params: [address]
    });
    const fileEncrypted = JSON.stringify(encrypt({
        data: fileConBase64,
        publicKey: pubKey,
        version: "x25519-xsalsa20-poly1305",
    }));
    const fileNameEncrypted = JSON.stringify(encrypt({
        data: ((fileName)),
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
    //console.log("file-upload: ", resp);
    alert("Datei erfolgreich hochgeladen!");
    window.location.reload();
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
        console.log(file);
        await encryptAndUploadPDF(props.patientAddress, new Uint8Array(await file.arrayBuffer()), file.name);
    };
    useEffect(() => {
        const block = (e) => {
            if (e.ctrlKey && e.key === "p" || e.ctrlKey && e.key === "s") {
                e.preventDefault();
                alert("Drucken/ speichern deaktiviert!");
            }
        };
        document.addEventListener("keydown", block);
        return () => document.removeEventListener("keydown", block);
    }, []);
    return (
        <div  style={{ padding: 20}}>
            <h2>PDF Hochladen</h2>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            {previewURL && (
                <div onContextMenu={(e) => e.preventDefault()}>
                    <p>Vorschau:</p>
                    <iframe src={previewURL} width="100%" height="400px" title="PDF Vorschau"></iframe>
                </div>
            )}
            <button onClick={handleUpload} style={{ marginTop: 10 }}>Hochladen</button>
        </div>
    );
};


export default PatientHome;
