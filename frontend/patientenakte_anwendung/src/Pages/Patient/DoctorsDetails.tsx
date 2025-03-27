import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../../Styles/DoctorsDetails.css";
import { getContract } from "../../contractConfig";
import { doctors, documents, releasedDocuments } from '../../db/schema';
import { encrypt } from '@metamask/eth-sig-util';
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import jsPDF from "jspdf";

type AddressProps = {
    patientAddress: string;
};

type Document = typeof documents.$inferSelect;

type Access = {
    access: boolean,
    expiresAt: bigint,
    remainingUses: bigint,
};
const processPDF = async (pdfData: Uint8Array, pubDoc: string) => {

    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    const processedImages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Wasserzeichen hinzufügen
        const watermarkedImage = await addWatermark(canvas, pubDoc);
        processedImages.push(watermarkedImage);
    }

    // Bilder wieder in ein PDF speichern
    return generatePDF(processedImages);
};

const addWatermark = (canvas: HTMLCanvasElement, watermarkText: string) => {
    return new Promise<string>((resolve) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.font = "20px Arial";
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Transparenter roter Text
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(watermarkText, -50, 400);
        ctx.fillText(watermarkText, -150, 700);
        resolve(canvas.toDataURL("image/png"));
    });
};

const generatePDF = (images: string[]) => {
    const pdf = new jsPDF();

    images.forEach((img, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(img, "PNG", 10, 10, 0, 0);
    });

    //pdf.save("processed.pdf");
    return pdf.output("arraybuffer");
};
function DoctorDetails(props: AddressProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { value } = useParams(); // Holt den PublicKey aus der URL
    const location = useLocation();
    const navigate = useNavigate();
    const didFetch = useRef(false);

    const doctorName = location.state?.doctor.name || "Unbekannt";
    const allDoctors: typeof doctors.$inferSelect[] = location.state?.allDoctors || [];
    const validDoctor: typeof doctors.$inferSelect | undefined = allDoctors.find(
        (doctor: typeof doctors.$inferSelect) => doctor.id === value!.toLowerCase()
    );

    const [allDocuments, setDocuments] = useState<Document[]>([]);
    const [accessList, setAccessList] = useState<Access[]>([]);
    // const [sharedDocuments, setSharedDocuments] = useState<{ releasedDocuments: typeof releasedDocuments.$inferSelect, documents: typeof documents.$inferSelect }[]>([]);
    const fetchStuff = async () => {
        const docs: Document[] = await fetch(`/api/documents/patient_small/${props.patientAddress.toLowerCase()}`)
            .then((r) => r.json());
        console.log(docs);
        if (docs.length == 0) {
            console.log("returning early");
            setDocuments([]);
            setAccessList([]);
            return;
        }
        const { contract } = await getContract("patientenakte");
        if (!contract) { return; }

        const docIds = docs.map((doc) => BigInt(doc.id));
        console.log(`checking if doctor: ${value} has access to [${docIds}]`);
        const accessListRet: Access[] = await contract.whoHasAccess(
            value!.toLowerCase(),
            docIds
        );
        console.log("accessList: ", accessListRet);
        const encoder = new TextEncoder();
        let documentsDecTitle: Document[] = new Array(docs.length);
        for (let i = 0; i < docs.length; ++i) {
            const doc = docs[i];
            console.log(doc);

            const a = encoder.encode(doc.name);
            const b = Array.from(a).map((n) => n.toString(16).padStart(2, '0')).join('');
            const req = { method: "eth_decrypt", params: [`0x${b}`, props.patientAddress] };
            console.log(`decrypting ${doc.name} (0x${b})`);
            const decTitle: string = await window.ethereum!.request(req);

            // const keyBuffer = (Uint8Array.from(atob(decTitle), (m) => m.codePointAt(0)));
            // const keyBufferDecod = decoder.decode(keyBuffer);
            console.log(decTitle);
            // console.log(keyBufferDecod);
            documentsDecTitle[i] = {
                id: doc.id,
                name: decTitle,
                patientAddress: doc.patientAddress,
                content: doc.content,
            };
        }
        setDocuments(documentsDecTitle);
        setAccessList(accessListRet);
    };
    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        fetchStuff();
    }, []);
    let unSharedDocuments: typeof documents.$inferSelect[] = [];
    let sharedDocumentsF: typeof documents.$inferSelect[] = [];
    for (let i = 0; i < allDocuments.length; ++i) {
        if (accessList[i].access) {
            sharedDocumentsF.push(allDocuments[i]);
        } else {
            unSharedDocuments.push(allDocuments[i]);
        }
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<typeof documents.$inferSelect | null>(null);
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [accessCount, setAccessCount] = useState<number>(1);

    const [isUnlimitedExpiry, setIsUnlimitedExpiry] = useState<boolean>(false);
    const [isUnlimitedAccess, setIsUnlimitedAccess] = useState<boolean>(false);

    const openModal = (document: typeof documents.$inferSelect) => {
        setSelectedDocument(document);
        setExpiryDate(getTomorrowDate());
        setIsModalOpen(true);
    };

    const getTodayDate = () => {
        return new Date().toISOString().split("T")[0]; // Heutiges Datum im "YYYY-MM-DD"-Format
    };
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0]; // "YYYY-MM-DD"
    };

    const closeModal = () => {
        setSelectedDocument(null);
        setIsModalOpen(false);
        setExpiryDate("");
        setAccessCount(1);
        setIsUnlimitedExpiry(false);
        setIsUnlimitedAccess(false);
    };

    function encBase64(s: ArrayBuffer) {
        const u8b = new Uint8Array(s);
        const binString = Array.from(u8b, (b) => String.fromCodePoint(b)).join("");
        const ret = btoa(binString);
        return ret;
    }

    async function exportCryptoKey(key: CryptoKey) {
        const exported = await window.crypto.subtle.exportKey("raw", key);
        return encBase64(exported);
    }

    const validShare = () => {
        if (expiryDate === "unbegrenzt") {
            return true;
        }
        const today = new Date();
        const selected = new Date(expiryDate);

        if(accessCount < 1){
            if(isUnlimitedAccess){
                return true
            }
            alert("Anzahl der Zugriffe muss mindestens 1 betragen");
            return false
        }

        if (selected > today) {
            return true;
        } else {
            alert("Das Ablaufdatum muss in der Zukunft liegen oder auf 'unbegrenzt' stehen.");
            return false;
        }
    };

    const handleShare = async () => {

        if(expiryDate < getTodayDate()){
            return alert("error");
        }

        const finalExpiryDate = isUnlimitedExpiry ? "0" : expiryDate;
        const finalAccessCount = isUnlimitedAccess ? "0" : accessCount;
        if (selectedDocument === null || selectedDocument === undefined) {
            console.log("trying to share null doc");
            return;
        }
        console.log(
            `Dokument "${selectedDocument}" wird mit Ablaufdatum ${finalExpiryDate} und ${finalAccessCount} Zugriffen freigegeben.`
        );
        try {
            const { contract, signer } = await getContract("patientenakte"); //signer falls man ihn mal braucht
            console.log(signer);
            console.log(contract);
            if (!contract) return;
            const exp_date = new Date(finalExpiryDate);
            const exp_date_u = BigInt((exp_date.getTime()) / 1000);
            const textEnc = new TextEncoder();
            const key = await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256,
                },
                true,
                ["encrypt", "decrypt"],
            );
            const iv = window.crypto.getRandomValues(new Uint8Array(16));

            const selDoc: Document[] = await fetch(`/api/documents/${selectedDocument.id}`).then((b) => b.json());

            const a = textEnc.encode(selDoc[0].content);
            const b = Array.from(a).map((n) => n.toString(16).padStart(2, '0')).join('');
            const req = { method: "eth_decrypt", params: [`0x${b}`, props.patientAddress] };
            console.log(`decrypting ${selectedDocument.name}-content (${selectedDocument.content})`);
            const decContent: string = await window.ethereum!.request(req);

            console.log(decContent.length);
            const contentBuffer = (Uint8Array.from(atob(decContent), (m) => m.codePointAt(0)));
            const imagePDF = await processPDF(contentBuffer, value!);
            const imagePDF64 = encBase64(imagePDF!);
            const decContentBuf = textEnc.encode(imagePDF64);
            const doc_enc = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                decContentBuf,
            );
            const pKey = await window.ethereum!.request({
                method: "eth_getEncryptionPublicKey",
                params: [value]
            });
            const name_enc = JSON.stringify(encrypt({ data: selectedDocument.name, publicKey: pKey, version: "x25519-xsalsa20-poly1305", }));
            const key_exp = (await exportCryptoKey(key));
            const jsonKey = { k: key_exp, i: Array.from(iv) };
            const jsonKeyString = JSON.stringify(jsonKey);
            const keyEnc = JSON.stringify(encrypt({
                data: jsonKeyString,
                publicKey: pKey,
                version: "x25519-xsalsa20-poly1305",
            }));
            console.log(
                [(value!.toLowerCase())],
                [selectedDocument.id],
                (exp_date_u),
                (finalAccessCount),
                isUnlimitedExpiry,
                isUnlimitedAccess,
                [keyEnc]
            );
            //grantMultiAccess(address[] memory _doctors, uint256[] memory _documentIDs, uint _expiresAt, uint _remainingUses, bool _expiresFlag, bool _usesFlag, string[] memory _encryptedKeys)
            const tx = await contract.grantMultiAccess(
                [(value!.toLowerCase())],
                [selectedDocument.id],
                exp_date_u,
                finalAccessCount,
                isUnlimitedExpiry,
                isUnlimitedAccess,
                [keyEnc]
            );
            await tx.wait();
            const jsonBody = {
                documentId: selectedDocument.id,
                doctorAddress: value!.toLowerCase(),
                patientAddress: props.patientAddress.toLowerCase(),
                name: name_enc,
                content: encBase64(doc_enc),
            };
            const jsonBodyString = JSON.stringify(jsonBody);
            const resp = await fetch(`/api/released_documents`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonBodyString,
            }).then((b) => { console.log(b); return b.json(); })
            console.log("post-reps: ", resp);

            alert("Zugriff erfolgreich gespeichert!");
            // window.location.reload();
        } catch (error) {
            console.error("Fehler bei grantMultiAccess:", error);
        }

        closeModal();
    };

    const revokeAccess = async (doc: typeof documents.$inferSelect) => {
        try {
            const { contract } = await getContract("patientenakte");
            if (!contract) return;

            console.log(`Dokument "${doc.name}" (id: ${doc.id}) wird für ${value} entzogen...`);

            const tx = await contract.revokeAccess(value, doc.id);
            await tx.wait();


            const deletionBody = JSON.stringify({
                documentId: doc.id,
                doctorAddress: value!.toLowerCase(),
            });
            console.log(deletionBody);
            const resp = await fetch(`/api/released_documents_dd/`, {
                method: "DELETE",
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: deletionBody,
            }).then((b) => b.json())
            console.log("post-reps: ", resp);
            alert(`Zugriff auf "${doc.name}" erfolgreich entfernt.`);
            // window.location.reload();
        } catch (error) {
            console.error("Fehler bei revokeAccess:", error);
            alert("Fehler beim Entfernen der Freigabe.");
        }
    };

    return (
        <div className="doctorsDetails-container">
            <div className="doctorsDetails-left">
                <h2>Arzt-Details</h2>
                <p>
                    <strong>Name:</strong> {doctorName}
                </p>
                <p>
                    <strong>PublicKey:</strong> {value}
                </p>
            </div>

            <div className="doctorsDetails-right">
                <h3>Zusätzliche Informationen</h3>
                <p>Hier könnten weitere Daten stehen.</p>
            </div>

            <div className="doctorsDetails-documents-container">
                <h3>Freigegebene Dokumente</h3>
                {sharedDocumentsF.length > 0 ? (
                    <ul className="shared-documents-list">
                        {sharedDocumentsF.map((doc, index) => (
                            <li key={index}>
                                <span>{doc.name}</span> {/* Document name on the left */}
                                <button
                                    className="revoke-button"
                                    onClick={() => revokeAccess(doc)}
                                >
                                    🗑️ Entfernen
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Keine freigegebenen Dokumente</p>
                )}


                <h3>Alle Dokumente</h3>
                {unSharedDocuments.length > 0 ? (
                    <ul>
                        {unSharedDocuments.map((doc, index) => (
                            <li
                                key={index}
                                className="document-item"
                                onClick={() => openModal(doc)}
                            >
                                {doc.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Keine Dokumente verfügbar</p>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Dokument freigeben: {selectedDocument?.name}</h3>

                        <div className="modal-input-group">
                            <label>Ablaufdatum:</label>
                            <div className="input-row">
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    disabled={isUnlimitedExpiry}
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isUnlimitedExpiry}
                                        onChange={() => setIsUnlimitedExpiry(!isUnlimitedExpiry)}
                                    />
                                    Unbegrenzt
                                </label>
                            </div>
                        </div>

                        {/* Anzahl der Zugriffe mit Checkbox */}
                        <div className="modal-input-group">
                            <label>Anzahl der Zugriffe:</label>
                            <div className="input-row">
                                <input
                                    type="number"
                                    min="1"
                                    value={accessCount}
                                    onChange={(e) => setAccessCount(Number(e.target.value))}
                                    disabled={isUnlimitedAccess}
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isUnlimitedAccess}
                                        onChange={() => setIsUnlimitedAccess(!isUnlimitedAccess)}
                                    />
                                    Unbegrenzt
                                </label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="modal-buttons">
                            <button onClick={() => {
                                    if(validShare()){
                                        handleShare();
                                    }
                                }}
                                className="share-btn">
                                Freigeben
                            </button>
                            <button onClick={closeModal} className="cancel-btn">
                                Abbrechen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorDetails;
