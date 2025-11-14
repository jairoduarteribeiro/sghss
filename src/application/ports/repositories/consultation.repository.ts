import type { Consultation } from "../../../domain/entities/consultation";
import type { Uuid } from "../../../domain/value-objects/uuid";

export interface IReadConsultationRepository {
  findByAppointmentId(appointmentId: Uuid): Promise<Consultation | null>;
}

export interface IWriteConsultationRepository {
  save(consultation: Consultation): Promise<void>;
  update(consultation: Consultation): Promise<void>;
  clear(): Promise<void>;
}
