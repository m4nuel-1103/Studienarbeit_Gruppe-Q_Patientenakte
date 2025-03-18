import { useLocation, useNavigate } from "react-router-dom";
import "../../Styles/PatientsDetails.css"
import { useState, useEffect, useRef } from "react";
import { releasedDocuments } from '../../db/schema';
import { getContract } from "../../contractConfig";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

type AddressProps = {
    address: string;
};

type RelDoc = typeof releasedDocuments.$inferSelect;

const PatientsDetails = (props: AddressProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { patient } = location.state || {};
    const [sharedDocuments, setSharedDocuments] = useState<RelDoc[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
            const hasAc: { access: boolean, expiresAt: bigint, remainingUses: bigint } = await contract.hasAccess(BigInt(doc.documentId));
            if (!hasAc.access) {
                window.alert("Ihr Zugriff auf dieses Dokument ist abgelaufen");
                const resp = await (await fetch(`/api/released_documents/${doc.id}`, { method: "DELETE" })).json();
                console.log(`deleted document ${doc.id} (${resp})`);
                return;
            }
            let tx: string | null = null;
            try {
                tx = await contract.useAccessRead(BigInt(doc.documentId));
            } catch {
                const txWrite = await contract.useAccessWrite(BigInt(doc.documentId));
                await txWrite.wait();
                tx = await contract.useAccessRead(BigInt(doc.documentId));
            }
            if (tx === null || tx === undefined) {
                window.alert("Kein Zugriff");
                return;
            }
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
            // setViewedPdf(st);
            console.log(st);
            console.log(decRes5);
            // Hier wird die blobUrl erstellt und PdfUrl zugewiesen
            const byteCharacters = atob(st);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            if (hasAc.remainingUses == 1n) {
                const resp = await (await fetch(`/api/released_documents/${doc.id}`, { method: "DELETE" })).json();
                console.log(`deleted document ${doc.id} (${resp})`);
                return;
            }
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
                        {pdfUrl !== null ?
                            <PDFCanvasViewer pdfUrl={pdfUrl} />
                            : <>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    );
};
const PDFCanvasViewer = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(0);
    const [pages, setPages] = useState([]);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (pdfUrl) {
            const loadingTask = pdfjs.getDocument(pdfUrl);
            loadingTask.promise.then(pdf => {
                setNumPages(pdf.numPages);
                const pagePromises = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    pagePromises.push(
                        pdf.getPage(i).then(page => {
                            const viewport = page.getViewport({ scale: 1.5 });
                            const canvas = document.createElement("canvas");
                            const context = canvas.getContext("2d");
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            return page.render({ canvasContext: context, viewport }).promise.then(() => canvas);
                        })
                    );
                }

                Promise.all(pagePromises).then(setPages);
            });
        }
    }, [pdfUrl]);

    return (
        <div
            ref={viewerRef}
            style={{
                maxHeight: "800px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px"
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {pages.map((canvas, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    {canvas && <canvas ref={(el) => el?.replaceWith(canvas)} />}
                </div>
            ))}
        </div>
    );
};


export default PatientsDetails;

