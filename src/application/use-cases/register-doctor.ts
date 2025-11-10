import { inject, injectable } from "inversify";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IWriteDoctorRepository } from "../ports/repositories/doctor.repository";
import { Doctor } from "../../domain/entities/doctor";
import { Name } from "../../domain/value-objects/name";
import { Crm } from "../../domain/value-objects/crm";
import { Uuid } from "../../domain/value-objects/uuid";

type RegisterDoctorInput = {
  name: string;
  crm: string;
  userId: string;
};

type RegisterDoctorOutput = {
  doctorId: string;
  name: string;
  crm: string;
  userId: string;
};

@injectable()
export class RegisterDoctorUseCase {
  constructor(
    @inject(SYMBOLS.IWriteDoctorRepository)
    private readonly writeDoctorRepository: IWriteDoctorRepository
  ) {}
  async execute(input: RegisterDoctorInput): Promise<RegisterDoctorOutput> {
    const doctor = Doctor.from(
      Name.from(input.name),
      Crm.from(input.crm),
      Uuid.fromString(input.userId)
    );
    await this.writeDoctorRepository.save(doctor);
    return {
      doctorId: doctor.id,
      name: doctor.name,
      crm: doctor.crm,
      userId: doctor.userId,
    };
  }
}
