import { ValidationError } from "../errors/validation.error";

const CRM_REGEX = /^\d{1,6}-[A-Z]{2}$/;

export class Crm {
  private constructor(readonly value: string) {}

  static from(crm: string): Crm {
    this.validate(crm);
    return new Crm(crm);
  }

  private static validate(crm: string): void {
    if (!this.hasValidFormat(crm)) {
      throw new ValidationError("CRM with invalid format");
    }
  }

  private static hasValidFormat(crm: string): boolean {
    return CRM_REGEX.test(crm);
  }
}
