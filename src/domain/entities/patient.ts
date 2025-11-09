import type { Name } from "../value-objects/name";
import type { Cpf } from "../value-objects/cpf";
import { Uuid } from "../value-objects/uuid";

export class Patient {
  private constructor(
    private readonly _id: Uuid,
    private readonly _name: Name,
    private readonly _cpf: Cpf,
    private readonly _userId: Uuid
  ) {}

  static from(name: Name, cpf: Cpf, userId: Uuid): Patient {
    return new Patient(Uuid.generate(), name, cpf, userId);
  }

  static restore(id: Uuid, name: Name, cpf: Cpf, userId: Uuid): Patient {
    return new Patient(id, name, cpf, userId);
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
