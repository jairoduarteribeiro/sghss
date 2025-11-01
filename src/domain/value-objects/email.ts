import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";

const EMAIL_REGEX =
  /^[a-z][a-z0-9]+(\.[a-z][a-z0-9]+)*@[a-z][a-z0-9]+(\.[a-z][a-z0-9]+)+$/;
const MAX_EMAIL_SIZE = 254;

export class Email {
  private constructor(public readonly value: string) {}

  public static create(email: string): Email {
    const normalizedEmail = this.normalize(email);
    this.validate(normalizedEmail);
    return new Email(normalizedEmail);
  }

  private static validate(email: string): void {
    if (email.length > MAX_EMAIL_SIZE) {
      throw new DomainError(VALIDATION_MESSAGES.EMAIL_TOO_LONG);
    }
    if (!this.hasValidFormat(email)) {
      throw new DomainError(VALIDATION_MESSAGES.EMAIL_INVALID_FORMAT);
    }
  }

  private static normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private static hasValidFormat(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }
}
