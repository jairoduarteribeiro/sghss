import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;

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
  }

  private static hasValidLength(plainText: string): boolean {
    return plainText.length >= MIN_LENGTH && plainText.length <= MAX_LENGTH;
  }
}
