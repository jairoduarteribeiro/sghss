import { ValidationError } from "../errors/validation.error";

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;
const ALLOWED_SPECIAL_CHARS = "!@#$%^&*._-";

export class Password {
  private constructor(readonly hash: string) {}

  static async from(plainText: string): Promise<Password> {
    this.validate(plainText);
    const hash = await Bun.password.hash(plainText);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  async verify(plainText: string): Promise<boolean> {
    return await Bun.password.verify(plainText, this.hash);
  }

  private static validate(plainText: string): void {
    if (!this.hasValidLength(plainText)) {
      throw new ValidationError(
        `Password length must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`
      );
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
      else throw new ValidationError("Password contains invalid characters");
    }
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      throw new ValidationError(
        "Password must have at least 1 uppercase, 1 lowercase, 1 number and 1 special character"
      );
    }
  }
}
