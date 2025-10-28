import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { createPatientID, type PatientID } from "@/domain/types/id";

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

  public static create(input: {
    name: string;
    cpf: Cpf;
    email: Email;
    password: Password;
  }): Patient {
    return new Patient({
      id: createPatientID(),
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      password: input.password,
    });
  }

  public static hydrate(input: {
    id: PatientID;
    name: string;
    cpf: Cpf;
    email: Email;
    password: Password;
  }): Patient {
    return new Patient({
      id: input.id,
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      password: input.password,
    });
  }
}
