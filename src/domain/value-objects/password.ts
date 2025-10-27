import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;
const ALLOWED_SPECIAL_CHARS = "!@#$%^&*._-";

export class Password {
  private constructor(public readonly hash: string) {}

  public static async create(plainText: string): Promise<Password> {
    this.validate(plainText);
    const hash = await Bun.password.hash(plainText);
    return new Password(hash);
  }

  public static hydrate(hash: string): Password {
    return new Password(hash);
  }

  public async verify(plainText: string): Promise<boolean> {
    return await Bun.password.verify(plainText, this.hash);
  }

  private static validate(plainText: string): void {
    if (!this.hasValidLength(plainText)) {
      throw new DomainError(VALIDATION_MESSAGES.PASSWORD_INVALID_LENGTH);
    }
    this.checkComplexity(plainText);
  }

  private static hasValidLength(plainText: string): boolean {
    return plainText.length >= MIN_LENGTH && plainText.length <= MAX_LENGTH;
  }

  private static checkComplexity(plainText: string): void {
    let hasUpper = false;
    let hasLower = false;
    let hasNumber = false;
    let hasSpecial = false;
    for (const ch of plainText) {
      if (ch >= "A" && ch <= "Z") hasUpper = true;
      else if (ch >= "a" && ch <= "z") hasLower = true;
      else if (ch >= "0" && ch <= "9") hasNumber = true;
      else if (ALLOWED_SPECIAL_CHARS.includes(ch)) hasSpecial = true;
      else throw new DomainError(VALIDATION_MESSAGES.PASSWORD_INVALID_CHARS);
    }
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      throw new DomainError(
        VALIDATION_MESSAGES.PASSWORD_DOES_NOT_MEET_COMPLEXITY
      );
    }
  }
}
