import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { appointments } from "./appointments";

export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().defaultRandom(),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  prescription: text("prescription"),
  referral: text("referral"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
});

export const consultationsRelations = relations(consultations, ({ one }) => ({
  appointment: one(appointments, {
    fields: [consultations.appointmentId],
    references: [appointments.id],
  }),
}));
