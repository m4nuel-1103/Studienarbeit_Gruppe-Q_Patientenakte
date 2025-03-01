import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

const releasedDocuments = pgTable("releasedDocuments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  documentId: integer("documentId").notNull(),
  // documentId: varchar("documentId", { length: 32 }).primaryKey(),
  doctorAddress: varchar("doctorAddress", { length: 32 }).notNull(),
  content: text("content").notNull(),
});

export default releasedDocuments;
