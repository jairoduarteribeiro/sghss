export class Crm {
  private constructor(readonly value: string) {}

  static from(crm: string): Crm {
    return new Crm(crm);
  }
}
