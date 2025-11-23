import { and, eq, type SQL } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../../../application/ports/repositories/doctor.repository";
import { Doctor } from "../../../../domain/entities/doctor";
import { Crm } from "../../../../domain/value-objects/crm";
import { MedicalSpecialty } from "../../../../domain/value-objects/medical-specialty";
import { Name } from "../../../../domain/value-objects/name";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { doctors } from "../schema";

@injectable()
export class DrizzleReadDoctorRepository implements IReadDoctorRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findById(id: Uuid): Promise<Doctor | null> {
    const [row] = await this.db.select().from(doctors).where(eq(doctors.id, id.value));
    return row
      ? Doctor.restore({
          id: Uuid.fromString(row.id),
          name: Name.from(row.name),
          crm: Crm.from(row.crm),
          specialty: MedicalSpecialty.from(row.specialty),
          userId: Uuid.fromString(row.userId),
        })
      : null;
  }

  async findByCrm(crm: Crm): Promise<Doctor | null> {
    const [row] = await this.db.select().from(doctors).where(eq(doctors.crm, crm.value));
    return row
      ? Doctor.restore({
          id: Uuid.fromString(row.id),
          name: Name.from(row.name),
          crm: Crm.from(row.crm),
          specialty: MedicalSpecialty.from(row.specialty),
          userId: Uuid.fromString(row.userId),
        })
      : null;
  }

  async findByUserId(userId: Uuid): Promise<Doctor | null> {
    const [row] = await this.db.select().from(doctors).where(eq(doctors.userId, userId.value));
    return row
      ? Doctor.restore({
          id: Uuid.fromString(row.id),
          name: Name.from(row.name),
          crm: Crm.from(row.crm),
          specialty: MedicalSpecialty.from(row.specialty),
          userId: Uuid.fromString(row.userId),
        })
      : null;
  }

  async findAll(filter: { name?: string; specialty?: string }): Promise<Doctor[]> {
    const conditions: SQL[] = [];
    if (filter.name) conditions.push(eq(doctors.name, filter.name));
    if (filter.specialty) conditions.push(eq(doctors.specialty, filter.specialty));
    const rows = await this.db
      .select()
      .from(doctors)
      .where(and(...conditions));
    return rows.map((row) =>
      Doctor.restore({
        id: Uuid.fromString(row.id),
        name: Name.from(row.name),
        crm: Crm.from(row.crm),
        specialty: MedicalSpecialty.from(row.specialty),
        userId: Uuid.fromString(row.userId),
      }),
    );
  }
}

@injectable()
export class DrizzleWriteDoctorRepository implements IWriteDoctorRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(doctor: Doctor): Promise<void> {
    await this.db.insert(doctors).values({
      id: doctor.id,
      name: doctor.name,
      crm: doctor.crm,
      specialty: doctor.specialty,
      userId: doctor.userId,
    });
  }

  async clear(): Promise<void> {
    await this.db.delete(doctors);
  }
}
