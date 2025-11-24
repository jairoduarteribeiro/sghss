import type { Appointment } from "../../../domain/entities/appointment";
import type { Doctor } from "../../../domain/entities/doctor";
import type { Patient } from "../../../domain/entities/patient";
import type { Slot } from "../../../domain/entities/slot";
import type { User } from "../../../domain/entities/user";
import type { Uuid } from "../../../domain/value-objects/uuid";

export type PatientAppointmentWithDetails = {
  appointment: Appointment;
  slot: Slot;
  doctor: Doctor;
};

export type DoctorAppointmentWithDetails = {
  appointment: Appointment;
  slot: Slot;
  patient: Patient;
};

export type PatientWithUser = {
  patient: Patient;
  user: User;
};

export interface IReadAppointmentRepository {
  findById(appointmentId: Uuid): Promise<Appointment | null>;
  findByDoctorId(doctorId: Uuid): Promise<Appointment[]>;
  findByPatientId(patientId: Uuid): Promise<Appointment[]>;
  findByPatientIdWithDetails(patientId: Uuid): Promise<PatientAppointmentWithDetails[]>;
  findByDoctorIdWithDetails(doctorId: Uuid): Promise<DoctorAppointmentWithDetails[]>;
  findPatientOwner(appointmentId: Uuid): Promise<PatientWithUser | null>;
}

export interface IWriteAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
  clear(): Promise<void>;
}
