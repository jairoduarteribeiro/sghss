import { z } from "../utils/zod";

export const registerPatientRequestSchema = z
  .object({
    name: z.string(),
    cpf: z.string(),
    email: z.email(),
    password: z.string(),
  })
  .openapi("RegisterPatientRequest");

export const registerPatientResponseSchema = z
  .object({
    userId: z.uuidv7(),
    email: z.email(),
    role: z.literal("PATIENT"),
    patientId: z.uuidv7(),
    name: z.string(),
    cpf: z.string(),
  })
  .openapi("RegisterPatientResponse");
