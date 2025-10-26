import { DomainError } from "@/domain/errors/domain-error";
import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export class Cpf {
  public readonly value: string;

  constructor(value: string) {
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
}
