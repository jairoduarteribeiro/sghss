import { inject, injectable } from "inversify";
import { Doctor } from "../../domain/entities/doctor";
import { Crm } from "../../domain/value-objects/crm";
import { MedicalSpecialty } from "../../domain/value-objects/medical-specialty";
import { Name } from "../../domain/value-objects/name";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import { ConflictError } from "../errors/conflict.error";
import type { IReadDoctorRepository, IWriteDoctorRepository } from "../ports/repositories/doctor.repository";

type RegisterDoctorInput = {
  name: string;
  crm: string;
  specialty: string;
  userId: string;
};

type RegisterDoctorOutput = {
  doctorId: string;
  name: string;
  crm: string;
  specialty: string;
  userId: string;
};

@injectable()
export class RegisterDoctorUseCase {
  constructor(
    @inject(SYMBOLS.IReadDoctorRepository)
    private readonly readDoctorRepository: IReadDoctorRepository,
    @inject(SYMBOLS.IWriteDoctorRepository)
    private readonly writeDoctorRepository: IWriteDoctorRepository,
  ) {}

  async execute(input: RegisterDoctorInput): Promise<RegisterDoctorOutput> {
    const crm = Crm.from(input.crm);
    if (await this.crmExists(crm)) {
      throw new ConflictError("Crm already in use");
    }
    const doctor = Doctor.from(
      Name.from(input.name),
      crm,
      MedicalSpecialty.from(input.specialty),
      Uuid.fromString(input.userId),
    );
    await this.writeDoctorRepository.save(doctor);
    return {
      doctorId: doctor.id,
      name: doctor.name,
      crm: doctor.crm,
      specialty: doctor.specialty,
      userId: doctor.userId,
    };
  }

  private async crmExists(crm: Crm): Promise<boolean> {
    const existingDoctor = await this.readDoctorRepository.findByCrm(crm);
    return existingDoctor !== null;
  }
}
