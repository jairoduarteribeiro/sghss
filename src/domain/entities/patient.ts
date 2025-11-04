import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { Uuid } from "@/domain/value-objects/uuid";
import { Name } from "@/domain/value-objects/name";

export class Patient {
  private constructor(
    private readonly _id: Uuid,
    private readonly _name: Name,
    private readonly _cpf: Cpf,
    private readonly _email: Email,
    private readonly _password: Password
  ) {}

  public static from(
    name: Name,
    cpf: Cpf,
    email: Email,
    password: Password
  ): Patient {
    return new Patient(Uuid.generate(), name, cpf, email, password);
  }

  get id(): string {
    return this._id.value;
  }

  get name(): string {
    return this._name.value;
  }

  get cpf(): string {
    return this._cpf.value;
  }

  get email(): string {
    return this._email.value;
  }

  get passwordHash(): string {
    return this._password.hash;
  }

  public async verifyPassword(plainText: string): Promise<boolean> {
    return await this._password.verify(plainText);
  }
}
