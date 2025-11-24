import z from "zod";
import { APPOINTMENT_MODALITY, APPOINTMENT_STATUS } from "../../../domain/entities/appointment";

export const registerAppointmentRequestSchema = z.object({
  slotId: z.uuidv7(),
  patientId: z.uuidv7(),
  modality: z.enum(APPOINTMENT_MODALITY),
});

const getAppointmentsCommonItemSchema = z.object({
  appointmentId: z.uuidv7(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  status: z.enum(APPOINTMENT_STATUS),
  modality: z.enum(APPOINTMENT_MODALITY),
  telemedicineLink: z.url().nullable(),
});

const getPatientAppointmentsItemSchema = getAppointmentsCommonItemSchema.extend({
  doctorName: z.string(),
  specialty: z.string(),
});

const getDoctorAppointmentsItemSchema = getAppointmentsCommonItemSchema.extend({
  patientName: z.string(),
});

export const getPatientAppointmentsResponseSchema = z.object({
  patientId: z.uuidv7(),
  appointments: z.array(getPatientAppointmentsItemSchema),
});

export const getDoctorAppointmentsResponseSchema = z.object({
  doctorId: z.uuidv7(),
  appointments: z.array(getDoctorAppointmentsItemSchema),
});

export const registerAppointmentResponseSchema = z.object({
  appointmentId: z.uuidv7(),
  slotId: z.uuidv7(),
  patientId: z.uuidv7(),
  doctorId: z.uuidv7(),
  status: z.enum(APPOINTMENT_STATUS),
  modality: z.enum(APPOINTMENT_MODALITY),
  telemedicineLink: z.url().nullable(),
});

export const cancelAppointmentRequestSchema = z.object({
  appointmentId: z.uuidv7(),
});
