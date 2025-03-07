import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../../Styles/DoctorsDetails.css";
// import { getDocuments } from "../../Services/GetData";
import { getContract } from "../../contractConfig";
import { doctors, documents, releasedDocuments } from '../../db/schema';
import { encrypt } from '@metamask/eth-sig-util';

type AddressProps = {
    patientAddress: string;
};

type Document = typeof documents.$inferSelect;

type Access = {
    access: boolean,
    expiresAt: bigint,
    remainingUses: bigint,
};

function DoctorDetails(props: AddressProps) {
    const { value } = useParams(); // Holt den PublicKey aus der URL
    const location = useLocation();
    const navigate = useNavigate();

    const doctorName = location.state?.doctor.name || "Unbekannt";
    const allDoctors: typeof doctors.$inferSelect[] = location.state?.allDoctors || [];
    const validDoctor: typeof doctors.$inferSelect | undefined = allDoctors.find(
        (doctor: typeof doctors.$inferSelect) => doctor.id === value!.toLowerCase()
    );

    const [allDocuments, setDocuments] = useState<Document[]>([]);
    const [accessList, setAccessList] = useState<Access[]>([]);
    // const [sharedDocuments, setSharedDocuments] = useState<{ releasedDocuments: typeof releasedDocuments.$inferSelect, documents: typeof documents.$inferSelect }[]>([]);
    const fetchStuff = async () => {
        const docs: Document[] = await fetch(`/api/documents/patient/${props.patientAddress.toLowerCase()}`)
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

        const docIds = docs.map((doc) => doc.id);
        console.log(`checking if doctor: ${value} has access to [${docIds}]`);
        const accessListRet: Access[] = await contract.whoHasAccess(
            value!,
            docIds
        );
        console.log("accessList: ", accessListRet);
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
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
    useEffect(() => { fetchStuff(); }, []);
    // useEffect(() => {
    //     fetch(`/api/documents/patient/${props.patientAddress.toLowerCase()}`)
    //         .then((r) => r.json())
    //         .then((data: Document[]) => {
    //             console.log(data);
    //             setDocuments(data);
    //             getContract("patientenakte")
    //                 .then(({ contract }) => {
    //                     if (!contract) { return; }
    //                     contract.whoHasAccess(value!, allDocuments.map((doc) => doc.id));
    //                 });
    //         });
    // }, []);
    // useEffect(() => {
    //     fetch(`/api/released_documents_for/doctor_patient?` + new URLSearchParams({ patient: props.patientAddress.toLowerCase(), doctor: value!.toLowerCase() }).toString())
    //         .then((r) => r.json())
    //         .then((data) => {
    //             console.log(data);
    //             setSharedDocuments(data);
    //         });
    // }, []);
    let unSharedDocuments: typeof documents.$inferSelect[] = [];
    let sharedDocumentsF: typeof documents.$inferSelect[] = [];
    for (let i = 0; i < allDocuments.length; ++i) {
        if (accessList[i].access) {
            sharedDocumentsF.push(allDocuments[0]);
        } else {
            unSharedDocuments.push(allDocuments[0]);
        }
    }
    // for (let doc of allDocuments) {
    //     let shared = false;
    //     for (let sDoc of sharedDocuments) {
    //         console.log(`comparing ${doc.id} and ${sDoc.documents.id}`);
    //         if (sDoc.documents.id == doc.id) {
    //             shared = true;
    //             sharedDocumentsF.push(doc);
    //             break;
    //         }
    //     }
    //     if (shared) {
    //         continue;
    //     }
    //     unSharedDocuments.push(doc);
    // }
    // console.log(`all: ${allDocuments}\nshared: ${sharedDocuments}\n sharedDocumentsF: ${sharedDocumentsF}\nunshared: ${unSharedDocuments}`);
    // const unSharedDocuments = allDocuments.filter(async (doc) => {
    //     const { contract, signer } = await getContract("patientenakte");
    //     // console.log("Has Access Signer",signer.address);
    //     if (!contract || !signer) return;
    //     const tx = await contract.hasAccess(doc.id);
    //     const allAccess = await contract.accessList(await signer.getAddress(), app_hash);
    //     console.log("🔹 Zugriffseintrag:", allAccess);
    //     //const result = await contract.callStatic.hasAccess(1149696269n);
    //     //console.log("Zugriffserlaubnis Static: ",result);
    //
    //     console.log("Has access: ", tx);
    //
    // });
    // const allDocuments = getDocuments();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<typeof documents.$inferSelect | null>(null);
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [accessCount, setAccessCount] = useState<number>(1);

    const [isUnlimitedExpiry, setIsUnlimitedExpiry] = useState<boolean>(false);
    const [isUnlimitedAccess, setIsUnlimitedAccess] = useState<boolean>(false);

    const openModal = (document: typeof documents.$inferSelect) => {
        setSelectedDocument(document);
        setExpiryDate(getTodayDate());
        setIsModalOpen(true);
    };

    const getTodayDate = () => {
        return new Date().toISOString().split("T")[0]; // Heutiges Datum im "YYYY-MM-DD"-Format
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


    const handleShare = async () => {
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

            const a = textEnc.encode(selectedDocument.content);
            const b = Array.from(a).map((n) => n.toString(16).padStart(2, '0')).join('');
            const req = { method: "eth_decrypt", params: [`0x${b}`, props.patientAddress] };
            console.log(`decrypting ${selectedDocument.name}-content (${selectedDocument.content})`);
            const decContent: string = await window.ethereum!.request(req);
            console.log(decContent.length);
            const decContentBuf = textEnc.encode(decContent);
            // console.log(decContentBuf);


            // const contentBuffer = (Uint8Array.from(atob(decContent), (m) => m.codePointAt(0)));
            // const contentBufferDecod = new TextDecoder().decode(contentBuffer);
            // console.log(contentBufferDecod);
            // console.log(contentBuffer);

            const doc_enc = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                decContentBuf,
            );
            const name_enc = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                textEnc.encode(selectedDocument.name)
            );
            const pKey = await window.ethereum!.request({
                method: "eth_getEncryptionPublicKey",
                params: [value]
            });
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
                name: encBase64(name_enc),
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
        } catch (error) {
            console.error("Fehler bei grantMultiAccess:", error);
        }

        closeModal();
    };

    const hasAccess = async () => {//Bisher nur statische Testfunktion
        try {
            const teststring = "document1";
            const enc = new TextEncoder();
            const testEntcode = enc.encode(teststring!);
            const doc_hash = await window.crypto.subtle.digest("SHA-256", testEntcode);
            const app_hash = BigInt(new Uint32Array(doc_hash)[0]);
            console.log("🔹 Berechneter Document Hash (app_hash):", app_hash);
            const { contract, signer } = await getContract("patientenakte");
            console.log(contract);
            // console.log("Has Access Signer",signer.address);
            if (!contract || !signer) return;
            const allAccess = await contract.accessList(await signer.getAddress(), app_hash);
            console.log("🔹 Zugriffseintrag:", allAccess);
            //const result = await contract.callStatic.hasAccess(1149696269n);
            //console.log("Zugriffserlaubnis Static: ",result);

            const tx = await contract.hasAccess(1149696269);
            console.log("Has access: ", tx);
            //await tx.wait();


            //console.log(tx.value);
            alert("Has Access erfolgreich!");
        } catch (error) {
            console.error("Fehler bei hasAccess:", error);
        }

    }

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
        } catch (error) {
            console.error("Fehler bei revokeAccess:", error);
            alert("Fehler beim Entfernen der Freigabe.");
        }
    };

    // useEffect(() => {
    //     if (!validDoctor) {
    //         navigate("/doctors", { replace: true });
    //     }
    // }, [validDoctor, navigate]);

    return (
        <div className="doctorsDetails-container">
            {/* Linker Bereich: Arzt-Informationen */}
            <div className="doctorsDetails-left">
                <h2>Arzt-Details</h2>
                <p>
                    <strong>Name:</strong> {doctorName}
                </p>
                <p>
                    <strong>PublicKey:</strong> {value}
                </p>
            </div>

            {/* Rechter Bereich: Weitere Infos */}
            <div className="doctorsDetails-right">
                <h3>Zusätzliche Informationen</h3>
                <p>Hier könnten weitere Daten stehen.</p>
                {/* Testbutton für Access*/}
                <button onClick={hasAccess}>Has Access Test </button>
            </div>

            {/* Dokumentenbereich */}
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
                            <button onClick={handleShare} className="share-btn">
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
