import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { MAX_CRM_LENGTH } from "../../../../domain/value-objects/crm";
import { MAX_NAME_LENGTH } from "../../../../domain/value-objects/name";
import { users } from "./users";

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: MAX_NAME_LENGTH }).notNull(),
  crm: varchar("crm", { length: MAX_CRM_LENGTH }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const doctorsRelations = relations(doctors, ({ one }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
}));
