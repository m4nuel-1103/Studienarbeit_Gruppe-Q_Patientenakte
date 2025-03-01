import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  // id: varchar("id", { length: 32 }).primaryKey(),
  patientAddress: varchar("patientAddress", { length: 32 }).notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
});

export default documents;
