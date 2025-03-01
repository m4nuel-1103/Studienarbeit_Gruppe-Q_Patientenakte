import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../../Styles/DoctorsDetails.css";
// import { getDocuments } from "../../Services/GetData";
import { getContract } from "../../contractConfig";
import { doctors, documents } from '../../db/schema';

type DoctorDetailsProps = {
    patientAddress: string;
};

function DoctorDetails(props: DoctorDetailsProps) {
    const { value } = useParams(); // Holt den PublicKey aus der URL
    const location = useLocation();
    const navigate = useNavigate();

    const doctorName = location.state?.doctor.name || "Unbekannt";
    const allDoctors: typeof doctors.$inferSelect[] = location.state?.allDoctors || [];
    const validDoctor: typeof doctors.$inferSelect | undefined = allDoctors.find(
        (doctor: typeof doctors.$inferSelect) => doctor.id === value
    );

    const sharedDocuments = ["Befundbericht", "Rezept", "Laborwerte"];
    const [allDocuments, setDocuments] = useState<typeof documents.$inferSelect[]>([]);
    useEffect(() => {
        fetch(`/api/documents/patient/${props.patientAddress}`)
            .then((r) => r.json())
            .then((data) => {
                console.log(data);
                setDocuments(data);
            });
    }, []);
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
            // const enc = new TextEncoder();
            // const doc_name_data = enc.encode(selectedDocument!);
            //
            // const doc_hash = await window.crypto.subtle.digest("SHA-256", doc_name_data);
            // const app_hash = BigInt(new Uint32Array(doc_hash)[0]);
            const exp_date = new Date(finalExpiryDate);
            const exp_date_u = BigInt((exp_date.getTime()) / 1000);

            console.log([(value!)],
                [selectedDocument?.id],
                (exp_date_u),
                (finalAccessCount),
                isUnlimitedExpiry,
                isUnlimitedAccess,
                ["ENCRYPTED_AES_KEY"]);
            //grantMultiAccess(address[] memory _doctors, uint256[] memory _documentIDs, uint _expiresAt, uint _remainingUses, bool _expiresFlag, bool _usesFlag, string[] memory _encryptedKeys)
            const tx = await contract.grantMultiAccess(
                [(value!)],
                [app_hash],
                exp_date_u,
                finalAccessCount,
                isUnlimitedExpiry,
                isUnlimitedAccess,
                ["ENCRYPTED_AES_KEY"]
            );
            console.log(tx);
            await tx.wait();

            console.log(tx);
            alert("Zugriff erfolgreich gespeichert!");
        } catch (error) {
            console.error("Fehler bei grantMultiAccess:", error);
        }

        closeModal();
    };

    const hasAccess = async () => {//Bisher nur staatische Testfunktion
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
    useEffect(() => {
        if (!validDoctor) {
            navigate("/doctors", { replace: true });
        }
    }, [validDoctor, navigate]);

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
                {sharedDocuments.length > 0 ? (
                    <ul>
                        {sharedDocuments.map((doc, index) => (
                            <li key={index}>{doc}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Keine freigegebenen Dokumente</p>
                )}

                <h3>Alle Dokumente</h3>
                {allDocuments.length > 0 ? (
                    <ul>
                        {allDocuments.map((doc, index) => (
                            <li
                                key={index}
                                className="document-item"
                                onClick={() => openModal(doc.id)}
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
                        <h3>Dokument freigeben: {selectedDocument}</h3>

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
