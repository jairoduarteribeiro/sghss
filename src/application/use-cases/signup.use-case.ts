import { inject, injectable } from "inversify";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import type { IWritePatientRepository } from "@/application/repositories/patient.repository";
import { SYMBOLS } from "@/inversify.symbols";
import { User } from "@/domain/entities/user";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { Patient } from "@/domain/entities/patient";
import { Name } from "@/domain/value-objects/name";
import { Cpf } from "@/domain/value-objects/cpf";
import { Uuid } from "@/domain/value-objects/uuid";

type SignupInput = {
  name: string;
  cpf: string;
  email: string;
  password: string;
};

type SignupOutput = {
  userId: string;
  patientId: string;
  name: string;
  cpf: string;
  email: string;
  role: string;
};

@injectable()
export class SignupUseCase {
  constructor(
    @inject(SYMBOLS.IReadUserRepository)
    private readonly readUserRepository: IReadUserRepository,
    @inject(SYMBOLS.IWriteUserRepository)
    private readonly writeUserRepository: IWriteUserRepository,
    @inject(SYMBOLS.IWritePatientRepository)
    private readonly writePatientRepository: IWritePatientRepository
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
    const email = Email.from(input.email);
    if (await this.emailExists(email)) {
      throw new Error("Email already in use");
    }
    const user = User.from(
      email,
      await Password.from(input.password),
      "PATIENT"
    );
    const patient = Patient.from(
      Name.from(input.name),
      Cpf.from(input.cpf),
      Uuid.fromString(user.id)
    );
    await this.writeUserRepository.save(user);
    await this.writePatientRepository.save(patient);
    return {
      userId: user.id,
      patientId: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      email: user.email,
      role: user.role,
    };
  }

  private async emailExists(email: Email): Promise<boolean> {
    const existingUser = await this.readUserRepository.findByEmail(email);
    return existingUser !== null;
  }
}
