import type { Patient } from "@/domain/entities/patient";
import type { Cpf } from "@/domain/value-objects/cpf";
import type { Email } from "@/domain/value-objects/email";

export interface IReadPatientRepository {
  findByCpf(cpf: Cpf): Promise<Patient | null>;
  findByEmail(email: Email): Promise<Patient | null>;
}

export interface IWritePatientRepository {
  save(patient: Patient): Promise<void>;
}
