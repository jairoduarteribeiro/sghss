import { inject, injectable } from "inversify";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../../../application/ports/repositories/doctor.repository";
import { Doctor } from "../../../../domain/entities/doctor";
import { Crm } from "../../../../domain/value-objects/crm";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type { DbClient } from "../drizzle-client";
import { doctors } from "../schema";
import { eq } from "drizzle-orm";
import { Uuid } from "../../../../domain/value-objects/uuid";
import { Name } from "../../../../domain/value-objects/name";

@injectable()
export class DrizzleReadDoctorRepository implements IReadDoctorRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByCrm(crm: Crm): Promise<Doctor | null> {
    const [row] = await this.db
      .select()
      .from(doctors)
      .where(eq(doctors.crm, crm.value));
    return row
      ? Doctor.restore(
          Uuid.fromString(row.id),
          Name.from(row.name),
          Crm.from(row.crm),
          Uuid.fromString(row.userId)
        )
      : null;
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
      userId: doctor.userId,
    });
  }

  async clear(): Promise<void> {
    await this.db.delete(doctors);
  }
}
