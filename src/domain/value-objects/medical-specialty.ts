export class MedicalSpecialty {
  private constructor(readonly value: string) {}

  static from(specialty: string): MedicalSpecialty {
    return new MedicalSpecialty(specialty);
  }
}
