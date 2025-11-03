import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";
import type { Patient } from "@/domain/entities/patient";
import type { Cpf } from "@/domain/value-objects/cpf";
import type { Email } from "@/domain/value-objects/email";
import { injectable } from "inversify";

@injectable()
export class InMemoryPatientRepository
  implements IReadPatientRepository, IWritePatientRepository
{
  private patients: Patient[] = [];

  public async findByCpf(cpf: Cpf): Promise<Patient | null> {
    return this.patients.find((patient) => patient.cpf === cpf.value) || null;
  }

  public async findByEmail(email: Email): Promise<Patient | null> {
    return (
      this.patients.find((patient) => patient.email === email.value) || null
    );
  }

  public async save(patient: Patient): Promise<void> {
    this.patients.push(patient);
  }

  public clear(): void {
    this.patients = [];
  }
}
