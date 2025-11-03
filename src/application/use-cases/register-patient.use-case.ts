import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";
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
    private readonly readPatientRepository: IReadPatientRepository,
    private readonly writePatientRepository: IWritePatientRepository
  ) {}

  public async execute(
    input: RegisterPatientInput
  ): Promise<RegisterPatientOutput> {
    const cpf = Cpf.from(input.cpf);
    if (await this.cpfExists(cpf)) {
      throw new Error("CPF already in use");
    }
    const email = Email.from(input.email);
    if (await this.emailExists(email)) {
      throw new Error("Email already in use");
    }
    const patient = Patient.from(
      input.name,
      cpf,
      email,
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

  private async emailExists(email: Email): Promise<boolean> {
    const patient = await this.readPatientRepository.findByEmail(email);
    return patient !== null;
  }

  private async cpfExists(cpf: Cpf): Promise<boolean> {
    const patient = await this.readPatientRepository.findByCpf(cpf);
    return patient !== null;
  }
}
