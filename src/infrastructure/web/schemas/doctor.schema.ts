import { z } from "../utils/zod";

export const registerDoctorRequestSchema = z
  .object({
    name: z.string(),
    crm: z.string(),
    specialty: z.string(),
    email: z.email(),
    password: z.string(),
  })
  .openapi("RegisterDoctorRequest");

export const registerDoctorResponseSchema = z
  .object({
    userId: z.uuidv7(),
    email: z.email(),
    role: z.literal("DOCTOR"),
    doctorId: z.uuidv7(),
    name: z.string(),
    crm: z.string(),
    specialty: z.string(),
  })
  .openapi("RegisterDoctorResponse");

export const listDoctorsRequestSchema = z
  .object({
    name: z.string().optional(),
    specialty: z.string().optional(),
  })
  .openapi("ListDoctorsRequest");

const doctorSchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  crm: z.string(),
  specialty: z.string(),
});

export const listDoctorsResponseSchema = z
  .object({
    doctors: z.array(doctorSchema),
  })
  .openapi("ListDoctorsResponse");
