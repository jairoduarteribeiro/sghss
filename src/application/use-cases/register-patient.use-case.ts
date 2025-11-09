import { Name } from "../../domain/value-objects/name";
import { inject, injectable } from "inversify";
import { Patient } from "../../domain/entities/patient";
import { Cpf } from "../../domain/value-objects/cpf";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../../inversify.symbols";
import { ConflictError } from "../errors/conflict.error";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../repositories/patient.repository";

type RegisterPatientInput = {
  name: string;
  cpf: string;
  userId: string;
};

type RegisterPatientOutput = {
  patientId: string;
  name: string;
  cpf: string;
  userId: string;
};

@injectable()
export class RegisterPatientUseCase {
  constructor(
    @inject(SYMBOLS.IReadPatientRepository)
    private readPatientRepository: IReadPatientRepository,
    @inject(SYMBOLS.IWritePatientRepository)
    private writePatientRepository: IWritePatientRepository
  ) {}

  async execute(input: RegisterPatientInput): Promise<RegisterPatientOutput> {
    const cpf = Cpf.from(input.cpf);
    if (await this.cpfExists(cpf)) {
      throw new ConflictError("CPF already in use");
    }
    const patient = Patient.from(
      Name.from(input.name),
      Cpf.from(input.cpf),
      Uuid.fromString(input.userId)
    );
    await this.writePatientRepository.save(patient);
    return {
      patientId: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      userId: patient.userId,
    };
  }

  private async cpfExists(cpf: Cpf): Promise<boolean> {
    const existingPatient = await this.readPatientRepository.findByCpf(cpf);
    return existingPatient !== null;
  }
}
