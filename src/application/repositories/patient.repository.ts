import type { Patient } from "@/domain/entities/patient";
import type { Email } from "@/domain/value-objects/email";

export interface IReadPatientRepository {
  findByEmail(email: Email): Promise<Patient | null>;
}

export interface IWritePatientRepository {
  save(patient: Patient): Promise<void>;
}
