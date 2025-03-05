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
        fetch(`/api/released_documents_for/doctor_patient?` + new URLSearchParams({ patient: patient!.id, doctor: props.address }).toString())
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
            if (!contract) return;
            const tx = await contract.useAccess(doc.documents.id);
            console.log(tx);
            await tx.wait();
            const rDoc: RelDoc = await fetch(`/api/released_documents/${doc.releasedDocuments.id}`)
                .then((r) => r.json());
            console.log(rDoc);
            const decRes = await window.ethereum!.request({ method: "eth_decrypt", params: [`0x${Buffer.from(tx, "utf8").toString("hex")}`, props.address] });
            console.log(decRes);
            const decRes2 = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: decRes.i },
                await window.crypto.subtle.importKey("raw", new Uint8Array(decRes.k), { name: "AES-GCM" }, true, ["encrypt", "decrypt"]),
                new Uint8Array(rDoc.content, "utf8")
            );
        } catch (error) {
        }


    };

    const dummyPDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

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
                                    onClick={() => window.open(dummyPDF, "_blank", "noopener,noreferrer")}
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

