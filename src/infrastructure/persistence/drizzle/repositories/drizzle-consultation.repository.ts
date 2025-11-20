import { desc, eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  ConsultationHistoryItem,
  IReadConsultationRepository,
  IWriteConsultationRepository,
} from "../../../../application/ports/repositories/consultation.repository";
import { Appointment } from "../../../../domain/entities/appointment";
import { Consultation } from "../../../../domain/entities/consultation";
import { Doctor } from "../../../../domain/entities/doctor";
import { Slot } from "../../../../domain/entities/slot";
import { Crm } from "../../../../domain/value-objects/crm";
import { MedicalSpecialty } from "../../../../domain/value-objects/medical-specialty";
import { Name } from "../../../../domain/value-objects/name";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { appointments, availabilities, consultations, doctors, slots } from "../schema";

@injectable()
export class DrizzleReadConsultationRepository implements IReadConsultationRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByAppointmentId(appointmentId: Uuid): Promise<Consultation | null> {
    const row = await this.db.query.consultations.findFirst({
      where: eq(consultations.appointmentId, appointmentId.value),
    });
    if (!row) {
      return null;
    }
    return Consultation.restore({
      id: Uuid.fromString(row.id),
      appointmentId: Uuid.fromString(row.appointmentId),
      notes: row.notes,
      diagnosis: row.diagnosis,
      prescription: row.prescription,
      referral: row.referral,
    });
  }

  async findAllByPatientId(patientId: Uuid): Promise<ConsultationHistoryItem[]> {
    const rows = await this.db
      .select({
        consultation: consultations,
        appointment: appointments,
        slot: slots,
        doctor: doctors,
      })
      .from(consultations)
      .innerJoin(appointments, eq(consultations.appointmentId, appointments.id))
      .innerJoin(slots, eq(appointments.slotId, slots.id))
      .innerJoin(availabilities, eq(slots.availabilityId, availabilities.id))
      .innerJoin(doctors, eq(availabilities.doctorId, doctors.id))
      .where(eq(appointments.patientId, patientId.value))
      .orderBy(desc(consultations.createdAt));
    return rows.map((row) => ({
      consultation: Consultation.restore({
        id: Uuid.fromString(row.consultation.id),
        appointmentId: Uuid.fromString(row.consultation.appointmentId),
        notes: row.consultation.notes,
        diagnosis: row.consultation.diagnosis,
        prescription: row.consultation.prescription,
        referral: row.consultation.referral,
      }),
      appointment: Appointment.restore(
        Uuid.fromString(row.appointment.id),
        row.appointment.status,
        row.appointment.modality,
        row.appointment.telemedicineLink,
        Uuid.fromString(row.appointment.slotId),
        Uuid.fromString(row.appointment.patientId),
      ),
      doctor: Doctor.restore({
        id: Uuid.fromString(row.doctor.id),
        name: Name.from(row.doctor.name),
        crm: Crm.from(row.doctor.crm),
        specialty: MedicalSpecialty.from(row.doctor.specialty),
        userId: Uuid.fromString(row.doctor.userId),
      }),
      slot: Slot.restore(
        Uuid.fromString(row.slot.id),
        new Date(row.slot.startDateTime),
        new Date(row.slot.endDateTime),
        row.slot.status,
        Uuid.fromString(row.slot.availabilityId),
      ),
    }));
  }
}

@injectable()
export class DrizzleWriteConsultationRepository implements IWriteConsultationRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(consultation: Consultation): Promise<void> {
    await this.db.insert(consultations).values({
      id: consultation.id,
      appointmentId: consultation.appointmentId,
      notes: consultation.notes,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription,
      referral: consultation.referral,
    });
  }

  async update(consultation: Consultation): Promise<void> {
    await this.db
      .update(consultations)
      .set({
        notes: consultation.notes,
        diagnosis: consultation.diagnosis,
        prescription: consultation.prescription,
        referral: consultation.referral,
      })
      .where(eq(consultations.id, consultation.id));
  }

  async clear(): Promise<void> {
    await this.db.delete(consultations);
  }
}
