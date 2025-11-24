import { z } from "zod";
import { SLOT_STATUS } from "../../../domain/entities/slot";

const slotSchema = z.object({
  slotId: z.uuidv7(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  status: z.enum(SLOT_STATUS),
});

export const registerAvailabilityRequestSchema = z.object({
  doctorId: z.uuidv7(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
});

export const registerAvailabilityResponseSchema = z.object({
  availabilityId: z.uuidv7(),
  doctorId: z.uuidv7(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  slots: z.array(slotSchema),
});

export const getAvailableSlotsRequestSchema = z.object({
  doctorId: z.uuidv7(),
});

export const getAvailableSlotsResponseSchema = z.object({
  doctorId: z.uuidv7(),
  availableSlots: z.array(slotSchema),
});
