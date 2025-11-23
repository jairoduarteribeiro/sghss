import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../../../application/ports/repositories/patient.repository";
import { Patient } from "../../../../domain/entities/patient";
import { Cpf } from "../../../../domain/value-objects/cpf";
import { Name } from "../../../../domain/value-objects/name";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { patients } from "../schema";

@injectable()
export class DrizzleReadPatientRepository implements IReadPatientRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findById(id: Uuid): Promise<Patient | null> {
    const [row] = await this.db.select().from(patients).where(eq(patients.id, id.value));
    return row
      ? Patient.restore({
          id: Uuid.fromString(row.id),
          name: Name.from(row.name),
          cpf: Cpf.from(row.cpf),
          userId: Uuid.fromString(row.userId),
        })
      : null;
  }

  async findByCpf(cpf: Cpf): Promise<Patient | null> {
    const [row] = await this.db.select().from(patients).where(eq(patients.cpf, cpf.value));
    return row
      ? Patient.restore({
          id: Uuid.fromString(row.id),
          name: Name.from(row.name),
          cpf: Cpf.from(row.cpf),
          userId: Uuid.fromString(row.userId),
        })
      : null;
  }

  async findByUserId(userId: Uuid): Promise<Patient | null> {
    const [row] = await this.db.select().from(patients).where(eq(patients.userId, userId.value));
    return row
      ? Patient.restore({
          id: Uuid.fromString(row.id),
          name: Name.from(row.name),
          cpf: Cpf.from(row.cpf),
          userId: Uuid.fromString(row.userId),
        })
      : null;
  }
}

@injectable()
export class DrizzleWritePatientRepository implements IWritePatientRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(patient: Patient): Promise<void> {
    await this.db.insert(patients).values({
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      userId: patient.userId,
    });
  }

  async clear(): Promise<void> {
    await this.db.delete(patients);
  }
}
