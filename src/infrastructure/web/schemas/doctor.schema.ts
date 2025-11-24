import { z } from "zod";

export const registerDoctorRequestSchema = z.object({
  name: z.string(),
  crm: z.string(),
  specialty: z.string(),
  email: z.email(),
  password: z.string(),
});

export const registerDoctorResponseSchema = z.object({
  userId: z.uuidv7(),
  email: z.email(),
  role: z.literal("DOCTOR"),
  doctorId: z.uuidv7(),
  name: z.string(),
  crm: z.string(),
  specialty: z.string(),
});

export const listDoctorsRequestSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
});

const doctorSchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  crm: z.string(),
  specialty: z.string(),
});

export const listDoctorsResponseSchema = z.object({
  doctors: z.array(doctorSchema),
});
