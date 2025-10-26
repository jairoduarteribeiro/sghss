import { DomainError } from "@/domain/errors/domain-error";
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
      throw new DomainError("CPF has an invalid format");
    }
  }

  private hasValidFormat(cpf: string): boolean {
    return CPF_REGEX.test(cpf);
  }
}
