import { useLocation, useNavigate } from "react-router-dom";
import "../../Styles/PatientsDetails.css"
import { useState, useEffect } from "react";
import { doctors, documents, releasedDocuments } from '../../db/schema';
import { getContract } from "../../contractConfig";

type AddressProps = {
    address: string;
};

type RelDoc = typeof releasedDocuments.$inferSelect;
type PDoc = typeof documents.$inferSelect;
type ComDoc = { releasedDocuments: RelDoc, documents: PDoc };

const PatientsDetails = (props: AddressProps) => {
    // Zugriff auf die Patientendaten über die Route
    const location = useLocation();
    const navigate = useNavigate();
    const { patient } = location.state || {};
    const [sharedDocuments, setSharedDocuments] = useState<ComDoc[]>([]);
    useEffect(() => {
        fetch(`/api/released_documents_for/doctor_patient?` + new URLSearchParams({ patient: patient!.id.toLowerCase(), doctor: props.address.toLowerCase() }).toString())
            .then((r) => r.json())
            .then((data) => {
                console.log(data);
                setSharedDocuments(data);
            });
    }, []);
    const fetchDoc = async (doc: ComDoc) => {
        try {
            const { contract, signer } = await getContract("patientenakte"); //signer falls man ihn mal braucht
            console.log(signer);
            console.log(contract);
            const enc = new TextEncoder();
            if (!contract) { console.error("no contract"); return; }
            console.log("doc-id: ", doc.documents.id);
            const hasAc = await contract.hasAccess(BigInt(doc.documents.id));
            if (!hasAc) return;
            const txWrite = await contract.useAccessWrite(BigInt(doc.documents.id));
            await txWrite.wait();
            const tx = await contract.useAccessRead(BigInt(doc.documents.id));
            const rDocA: RelDoc[] = await fetch(`/api/released_documents/${doc.releasedDocuments.id}`)
                .then((r) => r.json());
            if (rDocA.length != 1) return;
            const rDoc = rDocA[0];
            const a = enc.encode(tx);
            const b = Array.from(a).map((n) => n.toString(16).padStart(2, '0')).join('');
            const req = { method: "eth_decrypt", params: [`0x${b}`, props.address] };
            const decRes3 = await window.ethereum!.request(req);
            const decRes: { k: string, i: number[] } = JSON.parse(decRes3);
            const iv = Uint8Array.from(decRes.i);
            const keyBuffer = (Uint8Array.from(atob(decRes.k), (m) => m.codePointAt(0)));
            const symKey = await window.crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
            const decRes2 = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                symKey,
                Uint8Array.from(atob(rDoc.content), (m) => m.codePointAt(0))
            );
            const st = new TextDecoder().decode(decRes2);
            console.log(st);
        } catch (error) {
            console.log(`fetchDoc error: ${error}`, error);
        }
    };

    return (
        <>
            <div className="patient-detail-container">
                <div className="patient-header">

                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← Zurück
                    </button>
                    <h1 className="patient-title">Patient: {patient?.name || "Unbekannt"}</h1>
                </div>
                {/* Patientenname */}
                <div className="patient-detail-content">
                    {/* Alle Informationen */}
                    <div className="patient-info-box">
                        <h2>Alle Informationen zum Patienten</h2>
                        <p>ID: {patient?.id}</p>
                        <p>Geburtsdatum: {patient?.birthdate}</p>
                        <p>Wohnort: {patient?.city}</p>
                        <p>Diagnose: {patient?.diagnosis}</p>
                    </div>

                    {/* Dokumente-Abschnitt */}
                    <div className="documents-section">
                        <h2>Dokumente:</h2>
                        <div className="documents-grid">
                            {sharedDocuments.map((doc) => (
                                <div
                                    key={doc.documents.id}
                                    onClick={() => fetchDoc(doc)}
                                    className="document-box no-select"
                                >
                                    <p>{doc.documents.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientsDetails;

