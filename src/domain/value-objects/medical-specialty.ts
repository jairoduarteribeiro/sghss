import { ValidationError } from "../errors/validation.error";

const MIN_SPECIALTY_LENGTH = 2;
export const MAX_SPECIALTY_LENGTH = 50;

export class MedicalSpecialty {
  private constructor(readonly value: string) {}

  static from(specialty: string): MedicalSpecialty {
    const normalizedSpecialty = MedicalSpecialty.normalize(specialty);
    MedicalSpecialty.validate(normalizedSpecialty);
    return new MedicalSpecialty(normalizedSpecialty);
  }

  private static normalize(specialty: string): string {
    return specialty.trim().replace(/\s+/g, " ");
  }

  private static validate(specialty: string): void {
    if (!MedicalSpecialty.hasValidLength(specialty)) {
      throw new ValidationError(
        `Medical specialty must have length between ${MIN_SPECIALTY_LENGTH} and ${MAX_SPECIALTY_LENGTH}"`,
      );
    }
  }

  private static hasValidLength(specialty: string): boolean {
    return specialty.length >= MIN_SPECIALTY_LENGTH && specialty.length <= MAX_SPECIALTY_LENGTH;
  }
}
