import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import {
  createPatientID,
  hydratePatientID,
  type PatientID,
} from "@/domain/types/id";

type PatientProps = {
  id: PatientID;
  name: string;
  cpf: Cpf;
  email: Email;
  password: Password;
};

export class Patient {
  public readonly id: PatientID;
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
      id: createPatientID(),
      name: input.name,
      cpf: new Cpf(input.cpf),
      email: new Email(input.email),
      password: await Password.create(input.password),
    });
  }

  public static hydrate(input: {
    id: string;
    name: string;
    cpf: string;
    email: string;
    passwordHash: string;
  }): Patient {
    return new Patient({
      id: hydratePatientID(input.id),
      name: input.name,
      cpf: new Cpf(input.cpf),
      email: new Email(input.email),
      password: Password.hydrate(input.passwordHash),
    });
  }
}
