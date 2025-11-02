import type { IWritePatientRepository } from "@/application/repositories/patient.repository";
import { Patient } from "@/domain/entities/patient";
import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";

type RegisterPatientInput = {
  name: string;
  cpf: string;
  email: string;
  password: string;
};

type RegisterPatientOutput = {
  id: string;
  name: string;
  cpf: string;
  email: string;
};

export class RegisterPatientUseCase {
  constructor(
    private readonly writePatientRepository: IWritePatientRepository
  ) {}

  public async execute(
    input: RegisterPatientInput
  ): Promise<RegisterPatientOutput> {
    const patient = Patient.from(
      input.name,
      Cpf.from(input.cpf),
      Email.from(input.email),
      await Password.from(input.password)
    );
    await this.writePatientRepository.save(patient);
    return {
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      email: patient.email,
    };
  }
}
