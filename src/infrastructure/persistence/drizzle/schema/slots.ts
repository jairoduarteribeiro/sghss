import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { SLOT_STATUS } from "../../../../domain/entities/slot";
import { availabilities } from "./availabilities";

export const slotStatusEnum = pgEnum("slot_status", SLOT_STATUS);

export const slots = pgTable("slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  status: slotStatusEnum("status").notNull().default("AVAILABLE"),
  availabilityId: uuid("availability_id")
    .notNull()
    .references(() => availabilities.id, { onDelete: "cascade" }),
});

export const slotsRelations = relations(slots, ({ one }) => ({
  availability: one(availabilities, {
    fields: [slots.availabilityId],
    references: [availabilities.id],
  }),
}));
