// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { /* documentsTable, documentsReleased, */ patientTable, /* doctorTable */ } from './schema';
// // import jsonPublicKeys from "../Data/publicKeys.json";
// // import jsonDocuments from "../Data/documents.json"
// import jsonPatients from "../Data/patients.json"
//
// const db = drizzle(process.env.VITE_DATABASE_URL!);
//
// async function main() {
//     await db.delete(patientTable);
//     for (let patient_ of jsonPatients.patients) {
//         const patient: typeof patientTable.$inferInsert = patient_;
//         await db.insert(patientTable).values(patient);
//     }
//
//
//     const patients = await db.select().from(patientTable);
//     console.log('Getting all patients from the database: ', patients)
//     /*
//     const patients: {
//       id: number;
//       name: string;
//       age: number;
//       email: string;
//     }[]
//     */
// }
//
// main();
//
