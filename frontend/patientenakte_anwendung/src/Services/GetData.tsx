import jsonPublicKeys from "../Data/publicKeys.json";
import jsonDocuments from "../Data/documents.json"

export function getPublicKeys() {
  return jsonPublicKeys.publicKeys;
}

export function getDocuments() {
  return jsonDocuments.documents;
}
