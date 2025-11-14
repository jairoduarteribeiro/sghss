import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { doctors } from "./doctors";
import { slots } from "./slots";

export const availabilities = pgTable("availabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
});

export const availabilitiesRelations = relations(availabilities, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [availabilities.doctorId],
    references: [doctors.id],
  }),
  slots: many(slots),
}));
