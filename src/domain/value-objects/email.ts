import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";

export class Email {
  constructor(public readonly value: string) {
    this.value = this.normalize(value);
    this.validate(this.value);
  }

  private validate(email: string): void {
    if (email.length > 254) {
      throw new DomainError(VALIDATION_MESSAGES.EMAIL_TOO_LONG);
    }
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}
