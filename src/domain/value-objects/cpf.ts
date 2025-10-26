export class Cpf {
  public readonly value: string;

  constructor(value: string) {
    this.value = this.clean(value);
  }

  private clean(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }
}
