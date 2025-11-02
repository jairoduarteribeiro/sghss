import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { Uuid } from "@/domain/value-objects/uuid";

export class Patient {
  private constructor(
    private readonly _id: Uuid,
    private readonly _name: string,
    private readonly _cpf: Cpf,
    private readonly _email: Email,
    private readonly _password: Password
  ) {}

  public static async create(input: {
    name: string;
    cpf: string;
    email: string;
    password: string;
  }): Promise<Patient> {
    return new Patient(
      Uuid.generate(),
      input.name,
      Cpf.from(input.cpf),
      Email.from(input.email),
      await Password.from(input.password)
    );
  }

  public static hydrate(input: {
    id: string;
    name: string;
    cpf: string;
    email: string;
    passwordHash: string;
  }): Patient {
    return new Patient(
      Uuid.fromString(input.id),
      input.name,
      Cpf.from(input.cpf),
      Email.from(input.email),
      Password.fromHash(input.passwordHash)
    );
  }

  get id(): string {
    return this._id.value;
  }

  get name(): string {
    return this._name;
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
