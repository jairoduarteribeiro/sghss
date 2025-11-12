import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { slots } from "./slots";

export const appointmentStatusEnum = pgEnum("appointment_status", ["SCHEDULED", "COMPLETED", "CANCELLED"]);
export const appointmentModalityEnum = pgEnum("appointment_modality", ["IN_PERSON", "TELEMEDICINE"]);

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: appointmentStatusEnum("status").notNull().default("SCHEDULED"),
  modality: appointmentModalityEnum("modality").notNull(),
  telemedicineLink: text("telemedicine_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  slotId: uuid("slot_id")
    .notNull()
    .references(() => slots.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  slot: one(slots, {
    fields: [appointments.slotId],
    references: [slots.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
}));
