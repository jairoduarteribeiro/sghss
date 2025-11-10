import { inject, injectable } from "inversify";
import { eq } from "drizzle-orm";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../../../application/ports/repositories/patient.repository";
import { Patient } from "../../../../domain/entities/patient";
import { Cpf } from "../../../../domain/value-objects/cpf";
import { Uuid } from "../../../../domain/value-objects/uuid";
import { Name } from "../../../../domain/value-objects/name";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type { DbClient } from "../drizzle-client";
import { patients } from "../schema";

@injectable()
export class DrizzleReadPatientRepository implements IReadPatientRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByCpf(cpf: Cpf): Promise<Patient | null> {
    const [row] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.cpf, cpf.value));
    return row
      ? Patient.restore(
          Uuid.fromString(row.id),
          Name.from(row.name),
          Cpf.from(row.cpf),
          Uuid.fromString(row.userId)
        )
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
