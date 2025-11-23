import type { Appointment } from "../../../domain/entities/appointment";
import type { Doctor } from "../../../domain/entities/doctor";
import type { Slot } from "../../../domain/entities/slot";
import type { Uuid } from "../../../domain/value-objects/uuid";

export type AppointmentWithDetails = {
  appointment: Appointment;
  slot: Slot;
  doctor: Doctor;
};

export interface IReadAppointmentRepository {
  findById(appointmentId: Uuid): Promise<Appointment | null>;
  findByDoctorId(doctorId: Uuid): Promise<Appointment[]>;
  findByPatientId(patientId: Uuid): Promise<Appointment[]>;
  findByPatientIdWithDetails(patientId: Uuid): Promise<AppointmentWithDetails[]>;
}

export interface IWriteAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
  clear(): Promise<void>;
}
