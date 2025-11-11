import { ValidationError } from "../errors/validation.error";

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
export const CPF_LENGTH = 11;

export class Cpf {
  private constructor(readonly value: string) {}

  static from(cpf: string): Cpf {
    Cpf.validate(cpf);
    return new Cpf(Cpf.clean(cpf));
  }

  private static validate(cpf: string): void {
    if (!Cpf.hasValidFormat(cpf)) {
      throw new ValidationError("CPF with invalid format");
    }
    const cleanedCpf = Cpf.clean(cpf);
    if (Cpf.hasAllDigitsTheSame(cleanedCpf)) {
      throw new ValidationError("CPF cannot have all digits the same");
    }
    const firstDigit = Cpf.calculateCheckDigit(cleanedCpf.slice(0, 9));
    const secondDigit = Cpf.calculateCheckDigit(cleanedCpf.slice(0, 10));
    const checkDigits = Cpf.extractCheckDigits(cleanedCpf);
    if (checkDigits !== `${firstDigit}${secondDigit}`) {
      throw new ValidationError("CPF with invalid check digits");
    }
  }

  private static clean(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  private static hasValidFormat(cpf: string): boolean {
    return CPF_REGEX.test(cpf);
  }

  private static hasAllDigitsTheSame(cpf: string): boolean {
    const [firstDigit] = cpf;
    return cpf.split("").every((digit) => digit === firstDigit);
  }

  private static calculateCheckDigit(cpf: string): number {
    let weight = cpf.length + 1;
    const sum = cpf
      .split("")
      .map((digit) => parseInt(digit, 10))
      .reduce((acc, digit) => acc + digit * weight--, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private static extractCheckDigits(cpf: string): string {
    return cpf.slice(-2);
  }
}
