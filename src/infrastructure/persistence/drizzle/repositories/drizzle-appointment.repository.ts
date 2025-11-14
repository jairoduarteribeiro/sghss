import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadAppointmentRepository,
  IWriteAppointmentRepository,
} from "../../../../application/ports/repositories/appointment.repository";
import { Appointment } from "../../../../domain/entities/appointment";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { appointments } from "../schema";

@injectable()
export class DrizzleReadAppointmentRepository implements IReadAppointmentRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findById(appointmentId: Uuid): Promise<Appointment | null> {
    const [row] = await this.db.select().from(appointments).where(eq(appointments.id, appointmentId.value));
    return row
      ? Appointment.restore(
          Uuid.fromString(row.id),
          row.status as "SCHEDULED" | "COMPLETED" | "CANCELLED",
          row.modality as "IN_PERSON" | "TELEMEDICINE",
          row.telemedicineLink,
          Uuid.fromString(row.slotId),
          Uuid.fromString(row.patientId),
        )
      : null;
  }
}

@injectable()
export class DrizzleWriteAppointmentRepository implements IWriteAppointmentRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(appointment: Appointment): Promise<void> {
    await this.db.insert(appointments).values({
      id: appointment.id,
      slotId: appointment.slotId,
      patientId: appointment.patientId,
      status: appointment.status,
      modality: appointment.modality,
      telemedicineLink: appointment.telemedicineLink,
    });
  }

  async clear(): Promise<void> {
    await this.db.delete(appointments);
  }
}
