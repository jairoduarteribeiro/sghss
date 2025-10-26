import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";

const EMAIL_REGEX =
  /^[a-z][a-z0-9]+(\.[a-z][a-z0-9]+)*@[a-z][a-z0-9]+(\.[a-z][a-z0-9]+)+$/;

export class Email {
  constructor(public readonly value: string) {
    this.value = this.normalize(value);
    this.validate(this.value);
  }

  private validate(email: string): void {
    if (email.length > 254) {
      throw new DomainError(VALIDATION_MESSAGES.EMAIL_TOO_LONG);
    }
    if (!this.hasValidFormat(email)) {
      throw new DomainError(VALIDATION_MESSAGES.EMAIL_INVALID_FORMAT);
    }
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private hasValidFormat(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }
}
