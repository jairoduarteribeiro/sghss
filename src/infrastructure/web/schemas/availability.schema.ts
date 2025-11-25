import { SLOT_STATUS } from "../../../domain/entities/slot";
import { z } from "../utils/zod";

const slotSchema = z.object({
  slotId: z.uuidv7(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  status: z.enum(SLOT_STATUS),
});

export const registerAvailabilityRequestSchema = z
  .object({
    doctorId: z.uuidv7(),
    startDateTime: z.coerce.date(),
    endDateTime: z.coerce.date(),
  })
  .openapi("RegisterAvailabilityRequest");

export const registerAvailabilityResponseSchema = z
  .object({
    availabilityId: z.uuidv7(),
    doctorId: z.uuidv7(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    slots: z.array(slotSchema),
  })
  .openapi("RegisterAvailabilityResponse");

export const getAvailableSlotsRequestSchema = z
  .object({
    doctorId: z.uuidv7(),
  })
  .openapi("GetAvailableSlotsRequest");

export const getAvailableSlotsResponseSchema = z
  .object({
    doctorId: z.uuidv7(),
    availableSlots: z.array(slotSchema),
  })
  .openapi("GetAvailableSlotsResponse");
