import { useLocation, useNavigate } from "react-router-dom";
import "../../Styles/PatientsDetails.css"
import { useState, useEffect } from "react";
import { releasedDocuments } from '../../db/schema';
import { getContract } from "../../contractConfig";

type AddressProps = {
    address: string;
};

type RelDoc = typeof releasedDocuments.$inferSelect;

const PatientsDetails = (props: AddressProps) => {
    // Zugriff auf die Patientendaten über die Route
    const location = useLocation();
    const navigate = useNavigate();
    const { patient } = location.state || {};
    const [sharedDocuments, setSharedDocuments] = useState<RelDoc[]>([]);
    const [viewedPdf, setViewedPdf] = useState<string | null>(null);
    const fetchDocs = async () => {
        const docs: RelDoc[] = await (
            await fetch(
                `/api/released_documents_for_small/doctor_patient?` + new URLSearchParams(
                    {
                        patient: patient!.id.toLowerCase(),
                        doctor: props.address.toLowerCase()
                    }
                ).toString()
            )
        ).json();
        console.log(docs);
        const encoder = new TextEncoder();
        let documentsDecTitle: RelDoc[] = new Array(docs.length);
        for (let i = 0; i < docs.length; ++i) {
            const doc = docs[i];
            const docNameEncoded = encoder.encode(doc.name);
            const docNameHexEnc = Array.from(docNameEncoded).map((n) => n.toString(16).padStart(2, '0')).join('');
            const req = { method: "eth_decrypt", params: [`0x${docNameHexEnc}`, props.address] };
            console.log(`decrypting ${doc.name} (0x${docNameHexEnc})`);
            const decTitle: string = await window.ethereum!.request(req);
            console.log(decTitle);
            documentsDecTitle[i] = {
                id: doc.id,
                name: decTitle,
                doctorAddress: doc.doctorAddress,
                content: doc.content,
                documentId: doc.documentId,
                patientAddress: doc.patientAddress,
            };
        }
        setSharedDocuments(documentsDecTitle);
    };
    useEffect(() => { fetchDocs(); }, []);

    const fetchDoc = async (doc: RelDoc) => {
        try {
            const { contract, signer } = await getContract("patientenakte"); //signer falls man ihn mal braucht
            console.log(signer);
            console.log(contract);
            const enc = new TextEncoder();
            if (!contract) { console.error("no contract"); return; }
            console.log("doc-id: ", doc.documentId);
            const hasAc = await contract.hasAccess(BigInt(doc.documentId));
            console.log(hasAc);
            if (!hasAc.access) return;
            const txWrite = await contract.useAccessWrite(BigInt(doc.documentId));
            await txWrite.wait();
            const tx = await contract.useAccessRead(BigInt(doc.documentId));
            const rDocA: RelDoc[] = await fetch(`/api/released_documents/${doc.id}`)
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
            const decRes5 = Uint8Array.from(atob(st), (m) => m.codePointAt(0)).buffer;
            setViewedPdf(st);
            console.log(st);
            console.log(decRes5);
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
                <div className="patient-detail-content">
                    <div className="patient-info-box">
                        <h2>Alle Informationen zum Patienten</h2>
                        <p>ID: {patient?.id}</p>
                        <p>Geburtsdatum: {patient?.birthdate}</p>
                        <p>Wohnort: {patient?.city}</p>
                        <p>Diagnose: {patient?.diagnosis}</p>
                    </div>
                    <div className="documents-section">
                        <h2>Dokumente:</h2>
                        <div className="documents-grid">
                            {sharedDocuments.map((doc) => (
                                <div
                                    key={doc.documentId}
                                    onClick={() => fetchDoc(doc)}
                                    className="document-box no-select"
                                >
                                    <p>{doc.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        {viewedPdf !== null ?
                            <object width="100%" height={400} data={`data:application/pdf;base64,${viewedPdf}`} type="application/pdf" >
                                <p>
                                    loading pdf
                                </p>
                            </object>
                            // <Document file={`data:application/pdf;base64,${viewedPdf}`} />
                            : <>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientsDetails;

