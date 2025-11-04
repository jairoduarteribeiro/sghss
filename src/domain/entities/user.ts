import type { Email } from "@/domain/value-objects/email";
import type { Password } from "@/domain/value-objects/password";
import { Uuid } from "@/domain/value-objects/uuid";

export class User {
  private constructor(
    private readonly _id: Uuid,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _role: string
  ) {}

  public static from(
    email: Email,
    password: Password,
    role: string = "PATIENT"
  ): User {
    return new User(Uuid.generate(), email, password, role);
  }

  get id(): string {
    return this._id.value;
  }

  get email(): string {
    return this._email.value;
  }

  get passwordHash(): string {
    return this._password.hash;
  }

  get role(): string {
    return this._role;
  }

  public async verifyPassword(plainText: string): Promise<boolean> {
    return await this._password.verify(plainText);
  }
}
