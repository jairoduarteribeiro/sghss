import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadConsultationRepository,
  IWriteConsultationRepository,
} from "../../../../application/ports/repositories/consultation.repository";
import { Consultation } from "../../../../domain/entities/consultation";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { consultations } from "../schema";

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
