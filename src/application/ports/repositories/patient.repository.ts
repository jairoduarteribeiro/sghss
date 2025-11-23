import type { Patient } from "../../../domain/entities/patient";
import type { Cpf } from "../../../domain/value-objects/cpf";
import type { Uuid } from "../../../domain/value-objects/uuid";

export interface IReadPatientRepository {
  findById(id: Uuid): Promise<Patient | null>;
  findByCpf(cpf: Cpf): Promise<Patient | null>;
  findByUserId(userId: Uuid): Promise<Patient | null>;
}

export interface IWritePatientRepository {
  save(patient: Patient): Promise<void>;
  clear(): Promise<void>;
}
