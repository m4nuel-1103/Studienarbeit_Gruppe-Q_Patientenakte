import { useLocation, useNavigate } from "react-router-dom";
import "../../Styles/PatientsDetails.css"

const PatientsDetails = () => {
  // Zugriff auf die Patientendaten über die Route
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = location.state || {};

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
            {[1, 2, 3, 4].map((doc, index) => (
              <div
                key={index}
                onClick={() => window.open(dummyPDF, "_blank", "noopener,noreferrer")}
                className="document-box no-select"
              >
                <p>Dokument {index + 1}</p>
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

