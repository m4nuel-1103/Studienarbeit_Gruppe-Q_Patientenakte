import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle({ 
  connection: { 
    connectionString: process.env.VITE_DATABASE_URL!,
    ssl: true
  }
});

