import { useState } from "react";
import "../../Styles/Doctors.css";
import { getPublicKeys } from "../../Services/GetData";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

function Doctors() {
  const [allDoctors, setAllDoctors] = useState<
    { name: string; value: string }[]
  >([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [doctorInput, setDoctorInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const allPublicKeys = getPublicKeys();

  const navigate = useNavigate();

  const addDoctor = () => {
    const trimmedInput = doctorInput.trim();

    if (trimmedInput === "") {
      setErrorMessage("PublicKey darf nicht leer sein.");
      return;
    }

    const matchingDoctor = allPublicKeys.find(
      (doctor) => doctor.value.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (!matchingDoctor) {
      setErrorMessage("Falscher Key");
      return;
    }

    // Prüfen, ob der PublicKey bereits in allDoctors existiert
    const isInList = allDoctors.some(
      (doctor) => doctor.value === matchingDoctor.value
    );

    if (!isInList) {
      // Speichere das gesamte Objekt `{ name, value }` statt nur `value`
      setAllDoctors([
        ...allDoctors,
        { name: matchingDoctor.name, value: matchingDoctor.value },
      ]);
      setDoctorInput("");
      setErrorMessage("");
    } else {
      setErrorMessage("Arzt wurde bereits hinzugefügt");
    }
  };

  const removeDoctor = (doctorValue: string) => {
    setAllDoctors(allDoctors.filter((doctor) => doctor.value !== doctorValue));

    if (selectedDoctor === doctorValue) {
      setSelectedDoctor("");
    }
  };

  return (
    <div className="doctors-container">
      {/* Linke Spalte: Ärzte-Liste */}
      <div className="doctors-left">
        <h2>Ärzte-Liste</h2>
        <input
          type="text"
          placeholder="PublicKey eingeben"
          value={doctorInput}
          onChange={(e) => setDoctorInput(e.target.value)}
        />
        <button onClick={addDoctor}>Hinzufügen</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <p>Alle möglichen PublicKeys:</p>

        {allPublicKeys.map((key) => (
          <p key={key.value}>{key.value}</p>
        ))}
      </div>

      {/* Rechte Spalte: Arzt-Details */}
      <div className="doctors-right">
        <h2>Details</h2>
        <p>Wählen Sie einen Arzt, um mehr Informationen zu sehen.</p>
        {selectedDoctor && (
          <p>
            Gewählter Arzt: <strong>{selectedDoctor}</strong>
          </p>
        )}

        <div>
          {allDoctors.map((doctor, index) => (
            <div key={index} className="doctor-item">
              {/* Zeige den Namen an, navigiere aber zum PublicKey */}
              <span
                onClick={() =>
                  navigate(`/doctors/${doctor.value}`, {
                    state: { doctor, allDoctors },
                  })
                }
              >
                {doctor.name}
              </span>

              {/* Trash-Icon zum Löschen */}
              <DeleteIcon
                className="trash-icon"
                onClick={() => removeDoctor(doctor.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;
