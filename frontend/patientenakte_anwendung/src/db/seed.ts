import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { patients } from './schema';
import jsonPatients from "../Data/patients.json"

const db = drizzle(process.env.VITE_DATABASE_URL!);

async function main() {
    await db.delete(patients);
    for (let patient_ of jsonPatients.patients) {
        const patient: typeof patients.$inferInsert = patient_;
        await db.insert(patients).values(patient);
    }


    const patients2 = await db.select().from(patients);
    console.log('Getting all patients from the database: ', patients2)
}

main();

