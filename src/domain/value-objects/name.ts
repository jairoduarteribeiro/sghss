import { ValidationError } from "../errors/validation.error";

const MIN_LENGTH = 2;
const MAX_LENGTH = 255;

export class Name {
  private constructor(readonly value: string) {}

  static from(name: string): Name {
    const normalizedName = Name.normalize(name);
    Name.validate(normalizedName);
    return new Name(normalizedName);
  }

  private static normalize(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  private static validate(name: string): void {
    if (!Name.isValidLength(name)) {
      throw new ValidationError(
        `Name length must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`
      );
    }
  }

  private static isValidLength(name: string): boolean {
    return MIN_LENGTH <= name.length && name.length <= MAX_LENGTH;
  }
}
