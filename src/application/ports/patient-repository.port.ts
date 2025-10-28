import { Patient } from "@/domain/entities/patient";
import type { PatientID } from "@/domain/types/id";
import type { Cpf } from "@/domain/value-objects/cpf";
import type { Email } from "@/domain/value-objects/email";

export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  findById(id: PatientID): Promise<Patient | null>;
  findByCpf(cpf: Cpf): Promise<Patient | null>;
  findByEmail(email: Email): Promise<Patient | null>;
}
