import { z } from "zod";

export const registerConsultationRequestSchema = z.object({
  appointmentId: z.uuidv7(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  referral: z.string().optional(),
});

export const registerConsultationResponseSchema = z.object({
  consultationId: z.uuidv7(),
  appointmentId: z.uuidv7(),
  notes: z.string().nullable(),
  diagnosis: z.string().nullable(),
  prescription: z.string().nullable(),
  referral: z.string().nullable(),
});

export const getPatientHistoryRequestSchema = z.object({
  patientId: z.uuidv7(),
});

const historyItemSchema = z.object({
  consultationId: z.uuidv7(),
  appointmentDate: z.date(),
  status: z.string(),
  doctorName: z.string(),
  specialty: z.string(),
  diagnosis: z.string().nullable(),
  prescription: z.string().nullable(),
  notes: z.string().nullable(),
  referral: z.string().nullable(),
});

export const getPatientHistoryResponseSchema = z.object({
  patientId: z.uuidv7(),
  history: z.array(historyItemSchema),
});
