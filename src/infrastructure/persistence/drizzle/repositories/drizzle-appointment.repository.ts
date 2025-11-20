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
import { appointments, availabilities, slots } from "../schema";

@injectable()
export class DrizzleReadAppointmentRepository implements IReadAppointmentRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findById(appointmentId: Uuid): Promise<Appointment | null> {
    const [row] = await this.db.select().from(appointments).where(eq(appointments.id, appointmentId.value));
    return row
      ? Appointment.restore({
          id: Uuid.fromString(row.id),
          status: row.status as "SCHEDULED" | "COMPLETED" | "CANCELLED",
          modality: row.modality as "IN_PERSON" | "TELEMEDICINE",
          telemedicineLink: row.telemedicineLink,
          slotId: Uuid.fromString(row.slotId),
          patientId: Uuid.fromString(row.patientId),
        })
      : null;
  }

  async findByDoctorId(doctorId: Uuid): Promise<Appointment[]> {
    const rows = await this.db
      .select({
        appointment: appointments,
      })
      .from(appointments)
      .innerJoin(slots, eq(appointments.slotId, slots.id))
      .innerJoin(availabilities, eq(slots.availabilityId, availabilities.id))
      .where(eq(availabilities.doctorId, doctorId.value));
    return rows.map(({ appointment }) =>
      Appointment.restore({
        id: Uuid.fromString(appointment.id),
        status: appointment.status as "SCHEDULED" | "COMPLETED" | "CANCELLED",
        modality: appointment.modality as "IN_PERSON" | "TELEMEDICINE",
        telemedicineLink: appointment.telemedicineLink,
        slotId: Uuid.fromString(appointment.slotId),
        patientId: Uuid.fromString(appointment.patientId),
      }),
    );
  }

  async findByPatientId(patientId: Uuid): Promise<Appointment[]> {
    const rows = await this.db.select().from(appointments).where(eq(appointments.patientId, patientId.value));
    return rows.map((row) =>
      Appointment.restore({
        id: Uuid.fromString(row.id),
        status: row.status as "SCHEDULED" | "COMPLETED" | "CANCELLED",
        modality: row.modality as "IN_PERSON" | "TELEMEDICINE",
        telemedicineLink: row.telemedicineLink,
        slotId: Uuid.fromString(row.slotId),
        patientId: Uuid.fromString(row.patientId),
      }),
    );
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

  async update(appointment: Appointment): Promise<void> {
    await this.db
      .update(appointments)
      .set({
        status: appointment.status,
        modality: appointment.modality,
        telemedicineLink: appointment.telemedicineLink,
      })
      .where(eq(appointments.id, appointment.id));
  }

  async clear(): Promise<void> {
    await this.db.delete(appointments);
  }
}
