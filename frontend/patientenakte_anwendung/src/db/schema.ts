import { relations } from "drizzle-orm";
import { integer, pgTable, text, date } from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  birthdate: date("birthdate").notNull(),
  gender: text("gender").notNull(),
  city: text("city").notNull(),
  diagnosis: text("diagnosis").notNull(),
});

export const doctors = pgTable("doctors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientAddress: text("patientAddress").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
});

export const releasedDocuments = pgTable("releasedDocuments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  documentId: integer("documentId").notNull(),
  doctorAddress: text("doctorAddress").notNull(),
  patientAddress: text("patientAddress").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
});

export const patientRel = relations(patients, ({ many }) => ({
  documents: many(documents),
  releasedDocuments: many(releasedDocuments),
}));
export const doctorRel = relations(doctors, ({ many }) => ({
  releasedDocuments: many(releasedDocuments),
}));

export const docRel = relations(documents, ({ one, many }) => ({
  patient: one(patients, {
    fields: [documents.patientAddress],
    references: [patients.id],
  }),
  releasedDocuments: many(releasedDocuments),
}));

export const releasedDocumentsRel = relations(releasedDocuments, ({ one }) => ({
  documents: one(documents, {
    fields: [releasedDocuments.documentId],
    references: [documents.id],
  }),
  doctors: one(doctors, {
    fields: [releasedDocuments.doctorAddress],
    references: [doctors.id],
  }),
  patient: one(patients, {
    fields: [releasedDocuments.patientAddress],
    references: [patients.id],
  }),
}));
