import { useEffect, useState } from "react";
import "../../Styles/Patients.css";
import { useNavigate } from "react-router-dom";
import { patients } from '../../db/schema';

const Patients = () => {
    const [allPatients, setAllPatients] = useState<
        typeof patients.$inferInsert[]
    >([]);
    const [patientInput, setPatientInput] = useState("");
    useEffect(() => {
        fetch("/api/patients")
            .then((r) => r.json())
            .then((data) => {
                setAllPatients(data);
            });
    }, []);

    const navigate = useNavigate();

    // Filterfunktion für die Suche
    const handleSearch = () => {
        // const filteredPatients = allPatientsData.filter((patient) =>
        //     String(patient.id).toLowerCase().includes(patientInput.toLowerCase())
        // );
        // setAllPatients(filteredPatients);
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
                        {(allPatients /* > 0 ? allPatients : allPatientsData */).map(
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
