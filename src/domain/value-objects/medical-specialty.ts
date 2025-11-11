export class MedicalSpecialty {
  private constructor(readonly value: string) {}

  static from(specialty: string): MedicalSpecialty {
    const normalizedSpecialty = MedicalSpecialty.normalize(specialty);
    return new MedicalSpecialty(normalizedSpecialty);
  }

  private static normalize(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }
}
