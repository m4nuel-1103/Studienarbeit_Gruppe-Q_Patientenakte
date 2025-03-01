import { pgTable, text, varchar } from "drizzle-orm/pg-core";

const doctors = pgTable("doctors", {
  id: varchar("id", { length: 32 }).primaryKey(),
  // id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  // address: text("address").notNull(),
});

export default doctors;
