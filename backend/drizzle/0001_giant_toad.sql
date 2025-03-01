CREATE TABLE "releasedDocuments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "releasedDocuments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"documentId" integer NOT NULL,
	"doctorAddress" varchar(32) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "documentsReleased" CASCADE;