import { ValidationError } from "../errors/validation.error";

export const MAX_CRM_LENGTH = 9;

const CRM_REGEX = /^\d{1,6}-[A-Z]{2}$/;
const VALID_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export class Crm {
  private constructor(readonly value: string) {}

  static from(crm: string): Crm {
    Crm.validate(crm);
    return new Crm(crm);
  }

  private static validate(crm: string): void {
    if (!Crm.hasValidFormat(crm)) {
      throw new ValidationError("CRM with invalid format");
    }
    const state = Crm.extractState(crm);
    if (!Crm.isValidState(state)) {
      throw new ValidationError("CRM with invalid state");
    }
  }

  private static hasValidFormat(crm: string): boolean {
    return CRM_REGEX.test(crm);
  }

  private static extractState(crm: string): string {
    return crm.slice(-2);
  }

  private static isValidState(state: string): boolean {
    return VALID_STATES.includes(state);
  }
}
