import jsonPublicKeys from "../Data/publicKeys.json";
import jsonDocuments from "../Data/documents.json"
// import jsonPatients from "../Data/patients.json"
// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';
import { patients } from '../db/schema';

// const db = drizzle(import.meta.env.VITE_DATABASE_URL!);

export function getPublicKeys() {
    return jsonPublicKeys.publicKeys;
}

export function getDocuments() {
    return jsonDocuments.documents;
}

export async function getPatients() {
    // return jsonPatients.patients;
    console.log("asikin backend-resp");
    const ret: typeof patients.$inferInsert[] = await fetch("/api/patients", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((r) => {
        return r.json();
    });
    console.log("backend-resp: ", ret);
    return ret;
}
// return await db.select().from(patientTable);
// }
