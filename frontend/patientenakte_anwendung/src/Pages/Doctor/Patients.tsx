import { useState } from "react";
import "../../Styles/Patients.css";
import { getPatients } from "../../Services/GetData";
import { useNavigate } from "react-router-dom";

const Patients = () => {
  const [allPatients, setAllPatients] = useState<
    { name: string; id: string; birthdate: string; city: string }[]
  >([]);
  const [patientInput, setPatientInput] = useState("");
  const allPatientsData = getPatients();

  const navigate = useNavigate();

  // Filterfunktion für die Suche
  const handleSearch = () => {
    const filteredPatients = allPatientsData.filter((patient) =>
      patient.id.toLowerCase().includes(patientInput.toLowerCase())
    );
    setAllPatients(filteredPatients);
  };

  return (
    <div className="patients-container">
      <h2>Patienten-Liste</h2>

      {/* Suchfunktion */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Patienten-ID eingeben"
          value={patientInput}
          onChange={(e) => setPatientInput(e.target.value)}
        />
        <button onClick={handleSearch}>Suchen</button>
      </div>

      {/* Tabelle für die Patientenanzeige */}
      <div className="table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>PatNr.</th>
              <th>Name</th>
              <th>Geburtsdatum</th>
              <th>Wohnort</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {(allPatients.length > 0 ? allPatients : allPatientsData).map(
              (patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.birthdate}</td>
                  <td>{patient.city}</td>
                  <td>
                    <button
                      className="details-btn"
                      onClick={() =>
                        navigate(`/patients/${patient.id}`, {
                          state: { patient },
                        })
                      }
                    >
                      Details
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Patients;
