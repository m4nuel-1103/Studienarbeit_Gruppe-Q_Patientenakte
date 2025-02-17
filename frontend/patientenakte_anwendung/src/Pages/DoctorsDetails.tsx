import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../Styles/DoctorsDetails.css";
import { getDocuments } from "../Services/GetData";

interface Doctor {
  name: string;
  value: string;
}

function DoctorDetails() {
  const { value } = useParams(); // Holt den PublicKey aus der URL
  const location = useLocation();
  const navigate = useNavigate();

  const doctorName = location.state?.doctor.name || "Unbekannt";
  const allDoctors: Doctor[] = location.state?.allDoctors || [];
  const validDoctor: Doctor | undefined = allDoctors.find(
    (doctor: Doctor) => doctor.value === value
  );

  const sharedDocuments = ["Befundbericht", "Rezept", "Laborwerte"];
  const allDocuments = getDocuments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [accessCount, setAccessCount] = useState<number>(1);

  const [isUnlimitedExpiry, setIsUnlimitedExpiry] = useState<boolean>(false);
  const [isUnlimitedAccess, setIsUnlimitedAccess] = useState<boolean>(false);

  const openModal = (documentName: string) => {
    setSelectedDocument(documentName);
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

  const handleShare = () => {
    const finalExpiryDate = isUnlimitedExpiry ? "0" : expiryDate;
    const finalAccessCount = isUnlimitedAccess ? "0" : accessCount;

    console.log(
      `Dokument "${selectedDocument}" wird mit Ablaufdatum ${finalExpiryDate} und ${finalAccessCount} Zugriffen freigegeben.`
    );
    closeModal();
  };

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
                onClick={() => openModal(doc.name)}
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
