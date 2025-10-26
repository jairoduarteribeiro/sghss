import { DomainError } from "@/domain/errors/domain-error";
import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export class Cpf {
  public readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = this.clean(value);
  }

  private clean(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  private validate(cpf: string): void {
    if (!this.hasValidFormat(cpf)) {
      throw new DomainError(VALIDATION_MESSAGES.CPF_INVALID_FORMAT);
    }
  }

  private hasValidFormat(cpf: string): boolean {
    return CPF_REGEX.test(cpf);
  }
}
