import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";

type PatientProps = {
  id: string;
  name: string;
  cpf: Cpf;
  email: Email;
  password: Password;
};

export class Patient {
  public readonly id: string;
  public readonly name: string;
  public readonly cpf: Cpf;
  public readonly email: Email;
  public readonly password: Password;

  private constructor(props: PatientProps) {
    this.id = props.id;
    this.name = props.name;
    this.cpf = props.cpf;
    this.email = props.email;
    this.password = props.password;
  }

  public static async create(input: {
    name: string;
    cpf: string;
    email: string;
    password: string;
  }): Promise<Patient> {
    return new Patient({
      id: Bun.randomUUIDv7(),
      name: input.name,
      cpf: new Cpf(input.cpf),
      email: new Email(input.email),
      password: await Password.create(input.password),
    });
  }
}
