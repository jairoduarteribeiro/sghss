import type { Email } from "../value-objects/email";
import type { Password } from "../value-objects/password";
import { Uuid } from "../value-objects/uuid";

type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export class User {
  private constructor(
    private readonly _id: Uuid,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _role: UserRole,
  ) {}

  static from(email: Email, password: Password, role: UserRole = "PATIENT"): User {
    return new User(Uuid.generate(), email, password, role);
  }

  static restore(id: Uuid, email: Email, password: Password, role: UserRole): User {
    return new User(id, email, password, role);
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

  async verifyPassword(plainText: string): Promise<boolean> {
    return await this._password.verify(plainText);
  }
}
