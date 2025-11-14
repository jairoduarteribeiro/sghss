import type { Appointment } from "../../../domain/entities/appointment";
import type { Uuid } from "../../../domain/value-objects/uuid";

export interface IReadAppointmentRepository {
  findById(appointmentId: Uuid): Promise<Appointment | null>;
}

export interface IWriteAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  clear(): Promise<void>;
}
