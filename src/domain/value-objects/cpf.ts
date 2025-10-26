import { DomainError } from "@/domain/errors/domain-error";
import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export class Cpf {
  constructor(public readonly value: string) {
    this.validate(value);
    this.value = this.clean(value);
  }

  private validate(cpf: string): void {
    if (!this.hasValidFormat(cpf)) {
      throw new DomainError(VALIDATION_MESSAGES.CPF_INVALID_FORMAT);
    }
    const cleanedCpf = this.clean(cpf);
    if (this.hasAllDigitsTheSame(cleanedCpf)) {
      throw new DomainError(VALIDATION_MESSAGES.CPF_ALL_DIGITS_ARE_THE_SAME);
    }
    const firstDigit = this.calculateCheckDigit(cleanedCpf.slice(0, 9));
    const secondDigit = this.calculateCheckDigit(cleanedCpf.slice(0, 10));
    const checkDigits = this.extractCheckDigits(cleanedCpf);
    if (checkDigits !== `${firstDigit}${secondDigit}`) {
      throw new DomainError(VALIDATION_MESSAGES.CPF_INVALID_CHECK_DIGITS);
    }
  }

  private clean(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  private hasValidFormat(cpf: string): boolean {
    return CPF_REGEX.test(cpf);
  }

  private hasAllDigitsTheSame(cpf: string): boolean {
    const [firstDigit] = cpf;
    return cpf.split("").every((digit) => digit === firstDigit);
  }

  private calculateCheckDigit(cpf: string): number {
    let weight = cpf.length + 1;
    const sum = cpf
      .split("")
      .map((digit) => parseInt(digit, 10))
      .reduce((acc, digit) => acc + digit * weight--, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private extractCheckDigits(cpf: string): string {
    return cpf.slice(-2);
  }
}
