import type { Crm } from "../value-objects/crm";
import type { MedicalSpecialty } from "../value-objects/medical-specialty";
import type { Name } from "../value-objects/name";
import { Uuid } from "../value-objects/uuid";

type DoctorCreateProps = {
  name: Name;
  crm: Crm;
  specialty: MedicalSpecialty;
  userId: Uuid;
};

type DoctorRestoreProps = {
  id: Uuid;
  name: Name;
  crm: Crm;
  specialty: MedicalSpecialty;
  userId: Uuid;
};

export class Doctor {
  private constructor(
    private readonly _id: Uuid,
    private readonly _name: Name,
    private readonly _crm: Crm,
    private readonly _specialty: MedicalSpecialty,
    private readonly _userId: Uuid,
  ) {}

  static from(props: DoctorCreateProps): Doctor {
    return new Doctor(Uuid.generate(), props.name, props.crm, props.specialty, props.userId);
  }

  static restore(props: DoctorRestoreProps): Doctor {
    return new Doctor(props.id, props.name, props.crm, props.specialty, props.userId);
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

  get specialty(): string {
    return this._specialty.value;
  }

  get userId(): string {
    return this._userId.value;
  }
}
