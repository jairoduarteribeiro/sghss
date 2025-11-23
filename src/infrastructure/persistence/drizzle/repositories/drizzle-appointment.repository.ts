import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  AppointmentWithDetails,
  IReadAppointmentRepository,
  IWriteAppointmentRepository,
} from "../../../../application/ports/repositories/appointment.repository";
import { Appointment } from "../../../../domain/entities/appointment";
import { Doctor } from "../../../../domain/entities/doctor";
import { Slot } from "../../../../domain/entities/slot";
import { Crm } from "../../../../domain/value-objects/crm";
import { MedicalSpecialty } from "../../../../domain/value-objects/medical-specialty";
import { Name } from "../../../../domain/value-objects/name";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { appointments, availabilities, doctors, slots } from "../schema";

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

  async findByPatientIdWithDetails(patientId: Uuid): Promise<AppointmentWithDetails[]> {
    const rows = await this.db
      .select({
        appointment: appointments,
        slot: slots,
        doctor: doctors,
      })
      .from(appointments)
      .innerJoin(slots, eq(appointments.slotId, slots.id))
      .innerJoin(availabilities, eq(slots.availabilityId, availabilities.id))
      .innerJoin(doctors, eq(availabilities.doctorId, doctors.id))
      .where(eq(appointments.patientId, patientId.value));
    return rows.map(({ appointment, slot, doctor }) => ({
      appointment: Appointment.restore({
        id: Uuid.fromString(appointment.id),
        status: appointment.status as "SCHEDULED" | "COMPLETED" | "CANCELLED",
        modality: appointment.modality as "IN_PERSON" | "TELEMEDICINE",
        telemedicineLink: appointment.telemedicineLink,
        slotId: Uuid.fromString(appointment.slotId),
        patientId: Uuid.fromString(appointment.patientId),
      }),
      slot: Slot.restore({
        id: Uuid.fromString(slot.id),
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
        status: slot.status as "AVAILABLE" | "BOOKED" | "CANCELLED",
        availabilityId: Uuid.fromString(slot.availabilityId),
      }),
      doctor: Doctor.restore({
        id: Uuid.fromString(doctor.id),
        name: Name.from(doctor.name),
        crm: Crm.from(doctor.crm),
        specialty: MedicalSpecialty.from(doctor.specialty),
        userId: Uuid.fromString(doctor.userId),
      }),
    }));
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
