import type { Appointment } from "../../../domain/entities/appointment";
import type { Consultation } from "../../../domain/entities/consultation";
import type { Doctor } from "../../../domain/entities/doctor";
import type { Slot } from "../../../domain/entities/slot";
import type { Uuid } from "../../../domain/value-objects/uuid";

export type ConsultationHistoryItem = {
  consultation: Consultation;
  appointment: Appointment;
  doctor: Doctor;
  slot: Slot;
};

export interface IReadConsultationRepository {
  findByAppointmentId(appointmentId: Uuid): Promise<Consultation | null>;
  findAllByPatientId(patientId: Uuid): Promise<ConsultationHistoryItem[]>;
}

export interface IWriteConsultationRepository {
  save(consultation: Consultation): Promise<void>;
  update(consultation: Consultation): Promise<void>;
  clear(): Promise<void>;
}
