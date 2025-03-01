import { drizzle } from 'drizzle-orm/node-postgres'; // or mysql2, better-sqlite3
import pg from 'pg'; // or mysql2, better-sqlite3
// import * as schema from '#schema';
import * as dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  public db;

  constructor() {
    if (process.env.DATABASE_URL) {
      const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
      client.connect();
      this.db = drizzle(client);
      console.log(this.db);
    } else {
      throw new Error("DATABASE_URL not set");
    }
  }

  public getDb() {
    return this.db;
  }
}

export default new DatabaseService();

