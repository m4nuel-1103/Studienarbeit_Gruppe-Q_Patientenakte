import { relations } from "drizzle-orm";
import { integer, pgTable, text, date } from "drizzle-orm/pg-core";

// import doctors from "../app/models/doctor.js";
// import doctors from "#models/doctor";
// import patients from "#models/patient";
// import documents from "#models/document";
// import releasedDocuments from "#models/released_document";
// export { default as doctors } from "#models/doctor";
// export { default as patients } from "#models/patient";
// export { default as documents } from "#models/document";
// export { default as releasedDocuments } from "#models/released_document";
// import doctors from "./app/models/doctor.ts";
// import patients from "#models/patient";
// import documents from "#models/document";
// import releasedDocuments from "#models/released_document";
// export { default as doctors } from "#models/doctor";
// export { default as patients } from "#models/patient";
// export { default as documents } from "#models/document";
// export { default as releasedDocuments } from "#models/released_document";

export const patients = pgTable("patients", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    // address: text("address"),
    birthdate: date("birthdate").notNull(),
    gender: text("gender").notNull(),
    city: text("city").notNull(),
    diagnosis: text("diagnosis").notNull(),
});

export const doctors = pgTable("doctors", {
    id: text("id").primaryKey(),
    // id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    // address: text("address").notNull(),
});

export const documents = pgTable("documents", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // id: varchar("id", { length: 32 }).primaryKey(),
    patientAddress: text("patientAddress").notNull(),
    name: text("name").notNull(),
    content: text("content").notNull(),
});

export const releasedDocuments = pgTable("releasedDocuments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    documentId: integer("documentId").notNull(),
    // documentId: varchar("documentId", { length: 32 }).primaryKey(),
    doctorAddress: text("doctorAddress").notNull(),
    content: text("content").notNull(),
});



// export const documents = pgTable("documents", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
//   // id: varchar("id", { length: 32 }).primaryKey(),
//   patientAddress: varchar("patientAddress", { length: 32 }).notNull(),
//   name: text("name").notNull(),
//   content: text("content").notNull(),
// });
//
// export const releasedDocuments = pgTable("releasedDocuments", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
//   documentId: integer("documentId").notNull(),
//   // documentId: varchar("documentId", { length: 32 }).primaryKey(),
//   doctorAddress: varchar("doctorAddress", { length: 32 }).notNull(),
//   content: text("content").notNull(),
// });
//
// export const patients = pgTable("patients", {
//   id: varchar("id", { length: 32 }).primaryKey(),
//   name: text("name").notNull(),
//   // address: text("address"),
//   birthdate: date("birthdate").notNull(),
//   gender: text("gender").notNull(),
//   city: text("city").notNull(),
//   diagnosis: text("diagnosis").notNull(),
// });
//
// export const doctors = pgTable("doctors", {
//   id: varchar("id", { length: 32 }).primaryKey(),
//   // id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
//   name: text("name").notNull(),
//   // address: text("address").notNull(),
// });


// export doctors,
//   patients;
// export documents;
// export releasedDocuments;

export const patientRel = relations(patients, ({ many }) => ({
    documents: many(documents),
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
}));
