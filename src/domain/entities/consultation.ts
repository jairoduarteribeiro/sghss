import { Uuid } from "../value-objects/uuid";

type ConsultationCreateProps = {
  appointmentId: Uuid;
  notes?: string | null;
  diagnosis?: string | null;
  prescription?: string | null;
  referral?: string | null;
};

export class Consultation {
  private constructor(
    private readonly _id: Uuid,
    private readonly _appointmentId: Uuid,
    private readonly _notes: string | null,
    private readonly _diagnosis: string | null,
    private readonly _prescription: string | null,
    private readonly _referral: string | null,
  ) {}

  static from(props: ConsultationCreateProps): Consultation {
    return new Consultation(
      Uuid.generate(),
      props.appointmentId,
      props.notes ?? null,
      props.diagnosis ?? null,
      props.prescription ?? null,
      props.referral ?? null,
    );
  }

  get id(): string {
    return this._id.value;
  }

  get appointmentId(): string {
    return this._appointmentId.value;
  }

  get notes(): string | null {
    return this._notes;
  }

  get diagnosis(): string | null {
    return this._diagnosis;
  }

  get prescription(): string | null {
    return this._prescription;
  }

  get referral(): string | null {
    return this._referral;
  }
}
