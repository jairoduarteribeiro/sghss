import { relations } from "drizzle-orm";
import { char, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { CPF_LENGTH } from "../../../../domain/value-objects/cpf";
import { MAX_NAME_LENGTH } from "../../../../domain/value-objects/name";
import { users } from "./users";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: MAX_NAME_LENGTH }).notNull(),
  cpf: char("cpf", { length: CPF_LENGTH }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const patientsRelations = relations(patients, ({ one }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
}));
