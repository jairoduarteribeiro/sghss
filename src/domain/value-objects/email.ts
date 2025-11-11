import { ValidationError } from "../errors/validation.error";

const EMAIL_REGEX =
  /^[a-z][a-z0-9]+(\.[a-z][a-z0-9]+)*@[a-z][a-z0-9]+(\.[a-z][a-z0-9]+)+$/;
export const MAX_EMAIL_SIZE = 254;

export class Email {
  private constructor(readonly value: string) {}

  static from(email: string): Email {
    const normalizedEmail = Email.normalize(email);
    Email.validate(normalizedEmail);
    return new Email(normalizedEmail);
  }

  private static validate(email: string): void {
    if (email.length > MAX_EMAIL_SIZE) {
      throw new ValidationError("Email must be at most 254 characters long");
    }
    if (!Email.hasValidFormat(email)) {
      throw new ValidationError("Email with invalid format");
    }
  }

  private static normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private static hasValidFormat(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }
}
