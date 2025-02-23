import jsonPublicKeys from "../Data/publicKeys.json";
import jsonDocuments from "../Data/documents.json"
import jsonPatients from "../Data/Patients.json"

export function getPublicKeys() {
  return jsonPublicKeys.publicKeys;
}

export function getDocuments() {
  return jsonDocuments.documents;
}

export function getPatients() {
  return jsonPatients.patients;
}
