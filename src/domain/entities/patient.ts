import type { Cpf } from "../value-objects/cpf";
import type { Name } from "../value-objects/name";
import { Uuid } from "../value-objects/uuid";

type PatientCreateProps = {
  name: Name;
  cpf: Cpf;
  userId: Uuid;
};

type PatientRestoreProps = {
  id: Uuid;
  name: Name;
  cpf: Cpf;
  userId: Uuid;
};

export class Patient {
  private constructor(
    private readonly _id: Uuid,
    private readonly _name: Name,
    private readonly _cpf: Cpf,
    private readonly _userId: Uuid,
  ) {}

  static from(props: PatientCreateProps): Patient {
    return new Patient(Uuid.generate(), props.name, props.cpf, props.userId);
  }

  static restore(props: PatientRestoreProps): Patient {
    return new Patient(props.id, props.name, props.cpf, props.userId);
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

  get userId(): string {
    return this._userId.value;
  }
}
