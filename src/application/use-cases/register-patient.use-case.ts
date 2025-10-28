import type { PatientRepository } from "@/application/ports/patient-repository.port";
import type {
  RegisterPatientInput,
  RegisterPatientOutput,
} from "@/application/use-cases/register-patient.dto";
import { Patient } from "@/domain/entities/patient";
import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { ApplicationError } from "@/application/errors/application-error";
import { APPLICATION_ERROR_MESSAGES } from "@/application/constants/application-error-messages";

export class RegisterPatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  public async execute(
    input: RegisterPatientInput
  ): Promise<RegisterPatientOutput> {
    const cpf = new Cpf(input.cpf);
    if (await this.patientRepository.findByCpf(cpf)) {
      throw new ApplicationError(APPLICATION_ERROR_MESSAGES.CPF_ALREADY_IN_USE);
    }
    const email = new Email(input.email);
    if (await this.patientRepository.findByEmail(email)) {
      throw new ApplicationError(
        APPLICATION_ERROR_MESSAGES.EMAIL_ALREADY_IN_USE
      );
    }
    const patient = Patient.create({
      name: input.name,
      email,
      cpf,
      password: await Password.create(input.password),
    });
    await this.patientRepository.save(patient);
    return {
      id: patient.id,
    };
  }
}
