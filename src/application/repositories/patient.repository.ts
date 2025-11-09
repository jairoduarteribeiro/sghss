import type { Patient } from "../../domain/entities/patient";
import type { Cpf } from "../../domain/value-objects/cpf";

export interface IReadPatientRepository {
  findByCpf(cpf: Cpf): Promise<Patient | null>;
}

export interface IWritePatientRepository {
  save(patient: Patient): Promise<void>;
  clear(): Promise<void>;
}
