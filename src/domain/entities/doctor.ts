import type { Crm } from "../value-objects/crm";
import type { Name } from "../value-objects/name";
import { Uuid } from "../value-objects/uuid";

export class Doctor {
  private constructor(
    private readonly _id: Uuid,
    private readonly _name: Name,
    private readonly _crm: Crm,
    private readonly _userId: Uuid
  ) {}

  static from(name: Name, crm: Crm, userId: Uuid): Doctor {
    return new Doctor(Uuid.generate(), name, crm, userId);
  }

  static restore(id: Uuid, name: Name, crm: Crm, userId: Uuid): Doctor {
    return new Doctor(id, name, crm, userId);
  }

  get id(): string {
    return this._id.value;
  }

  get name(): string {
    return this._name.value;
  }

  get crm(): string {
    return this._crm.value;
  }

  get userId(): string {
    return this._userId.value;
  }
}
