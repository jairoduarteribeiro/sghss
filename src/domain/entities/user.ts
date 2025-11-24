import type { Email } from "../value-objects/email";
import type { Password } from "../value-objects/password";
import { Uuid } from "../value-objects/uuid";

export const USER_ROLES = ["PATIENT", "DOCTOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

type UserRestoreProps = {
  id: Uuid;
  email: Email;
  password: Password;
  role: UserRole;
};

type UserCreateProps = {
  email: Email;
  password: Password;
  role?: UserRole;
};

export class User {
  private constructor(
    private readonly _id: Uuid,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _role: UserRole,
  ) {}

  static from(props: UserCreateProps): User {
    return new User(Uuid.generate(), props.email, props.password, props.role ?? "PATIENT");
  }

  static restore(props: UserRestoreProps): User {
    return new User(props.id, props.email, props.password, props.role);
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

  get role(): UserRole {
    return this._role;
  }

  async verifyPassword(plainText: string): Promise<boolean> {
    return await this._password.verify(plainText);
  }
}
