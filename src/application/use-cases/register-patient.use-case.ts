import type { IWritePatientRepository } from "@/application/repositories/patient.repository";
import { Patient } from "@/domain/entities/patient";

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
    const patient = await Patient.create({
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      password: input.password,
    });
    await this.writePatientRepository.save(patient);
    return {
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      email: patient.email,
    };
  }
}
