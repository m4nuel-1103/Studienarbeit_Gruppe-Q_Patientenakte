import { pgTable, text, date, varchar } from "drizzle-orm/pg-core";


const patientTable = pgTable("patients", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: text("name").notNull(),
  // address: text("address"),
  birthdate: date("birthdate").notNull(),
  gender: text("gender").notNull(),
  city: text("city").notNull(),
  diagnosis: text("diagnosis").notNull(),
});

export default patientTable;
