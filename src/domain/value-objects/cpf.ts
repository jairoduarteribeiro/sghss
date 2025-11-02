const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export class Cpf {
  private constructor(public readonly value: string) {}

  public static create(cpf: string): Cpf {
    this.validate(cpf);
    return new Cpf(this.clean(cpf));
  }

  private static validate(cpf: string): void {
    if (!this.hasValidFormat(cpf)) {
      throw new Error("CPF with invalid format");
    }
    const cleanedCpf = this.clean(cpf);
    if (this.hasAllDigitsTheSame(cleanedCpf)) {
      throw new Error("CPF cannot have all digits the same");
    }
    const firstDigit = this.calculateCheckDigit(cleanedCpf.slice(0, 9));
    const secondDigit = this.calculateCheckDigit(cleanedCpf.slice(0, 10));
    const checkDigits = this.extractCheckDigits(cleanedCpf);
    if (checkDigits !== `${firstDigit}${secondDigit}`) {
      throw new Error("CPF with invalid check digits");
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
