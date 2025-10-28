import { Patient } from "@/domain/entities/patient";
import type { PatientID } from "@/domain/types/id";

export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  findById(id: PatientID): Promise<Patient | null>;
}
