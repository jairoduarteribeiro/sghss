import { inject, injectable } from "inversify";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadDoctorRepository } from "../ports/repositories/doctor.repository";

type ListDoctorsInput = {
  name?: string;
  specialty?: string;
};

type DoctorOutput = {
  id: string;
  name: string;
  crm: string;
  specialty: string;
};

type ListDoctorsOutput = {
  doctors: DoctorOutput[];
};

@injectable()
export class ListDoctorsUseCase {
  constructor(
    @inject(SYMBOLS.IReadDoctorRepository)
    private readonly readDoctorRepository: IReadDoctorRepository,
  ) {}

  async execute(input: ListDoctorsInput = {}): Promise<ListDoctorsOutput> {
    const doctors = await this.readDoctorRepository.findAll({
      name: input.name,
      specialty: input.specialty,
    });
    const output: DoctorOutput[] = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      crm: doctor.crm,
      specialty: doctor.specialty,
    }));
    return {
      doctors: output,
    };
  }
}
