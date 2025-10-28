import type { PatientRepository } from "@/application/ports/patient-repository.port";
import type {
  RegisterPatientInput,
  RegisterPatientOutput,
} from "@/application/use-cases/register-patient.dto";
import { Patient } from "@/domain/entities/patient";

export class RegisterPatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  public async execute(
    input: RegisterPatientInput
  ): Promise<RegisterPatientOutput> {
    const patient = await Patient.create({
      name: input.name,
      email: input.email,
      cpf: input.cpf,
      password: input.password,
    });
    await this.patientRepository.save(patient);
    return {
      id: patient.id,
    };
  }
}
