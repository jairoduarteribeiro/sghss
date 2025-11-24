import { Uuid } from "../value-objects/uuid";

export type ConsultationNotes = string | null;
export type ConsultationDiagnosis = string | null;
export type ConsultationPrescription = string | null;
export type ConsultationReferral = string | null;

type ConsultationCreateProps = {
  appointmentId: Uuid;
  notes?: ConsultationNotes;
  diagnosis?: ConsultationDiagnosis;
  prescription?: ConsultationPrescription;
  referral?: ConsultationReferral;
};

type ConsultationRestoreProps = {
  id: Uuid;
  appointmentId: Uuid;
  notes: ConsultationNotes;
  diagnosis: ConsultationDiagnosis;
  prescription: ConsultationPrescription;
  referral: ConsultationReferral;
};

export class Consultation {
  private constructor(
    private readonly _id: Uuid,
    private readonly _appointmentId: Uuid,
    private readonly _notes: ConsultationNotes,
    private readonly _diagnosis: ConsultationDiagnosis,
    private readonly _prescription: ConsultationPrescription,
    private readonly _referral: ConsultationReferral,
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

  static restore(props: ConsultationRestoreProps): Consultation {
    return new Consultation(
      props.id,
      props.appointmentId,
      props.notes,
      props.diagnosis,
      props.prescription,
      props.referral,
    );
  }

  get id(): string {
    return this._id.value;
  }

  get appointmentId(): string {
    return this._appointmentId.value;
  }

  get notes(): ConsultationNotes {
    return this._notes;
  }

  get diagnosis(): ConsultationDiagnosis {
    return this._diagnosis;
  }

  get prescription(): ConsultationPrescription {
    return this._prescription;
  }

  get referral(): ConsultationReferral {
    return this._referral;
  }
}
