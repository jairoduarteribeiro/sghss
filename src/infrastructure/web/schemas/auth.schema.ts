import { z } from "../utils/zod";

export const signupRequestSchema = z
  .object({
    name: z.string(),
    cpf: z.string(),
    email: z.email(),
    password: z.string(),
  })
  .openapi("SignupRequest");

export const signupResponseSchema = z
  .object({
    userId: z.uuidv7(),
    email: z.email(),
    role: z.literal("PATIENT"),
    patientId: z.uuidv7(),
    name: z.string(),
    cpf: z.string(),
  })
  .openapi("SignupResponse");

export const loginRequestSchema = z
  .object({
    email: z.email(),
    password: z.string(),
  })
  .openapi("LoginRequest");

export const loginResponseSchema = z
  .object({
    userId: z.uuidv7(),
    token: z.string(),
  })
  .openapi("LoginResponse");
