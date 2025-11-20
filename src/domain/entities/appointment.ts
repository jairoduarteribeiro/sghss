import { Uuid } from "../value-objects/uuid";

type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type AppointmentModality = "IN_PERSON" | "TELEMEDICINE";
type TelemedicineLink = string | null;

type AppointmentRestoreProps = {
  id: Uuid;
  status: AppointmentStatus;
  modality: AppointmentModality;
  telemedicineLink: TelemedicineLink;
  slotId: Uuid;
  patientId: Uuid;
};

export type AppointmentCreateProps =
  | { slotId: Uuid; patientId: Uuid; modality: "IN_PERSON" }
  | { slotId: Uuid; patientId: Uuid; modality: "TELEMEDICINE"; telemedicineLink: TelemedicineLink };

export class Appointment {
  private constructor(
    private readonly _id: Uuid,
    private _status: AppointmentStatus,
    private readonly _modality: AppointmentModality,
    private readonly _telemedicineLink: TelemedicineLink,
    private readonly _slotId: Uuid,
    private readonly _patientId: Uuid,
  ) {}

  static from(props: AppointmentCreateProps): Appointment {
    return new Appointment(
      Uuid.generate(),
      "SCHEDULED",
      props.modality,
      props.modality === "TELEMEDICINE" ? props.telemedicineLink : null,
      props.slotId,
      props.patientId,
    );
  }

  static restore(props: AppointmentRestoreProps): Appointment {
    return new Appointment(
      props.id,
      props.status,
      props.modality,
      props.telemedicineLink,
      props.slotId,
      props.patientId,
    );
  }

  get id(): string {
    return this._id.value;
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  get modality(): AppointmentModality {
    return this._modality;
  }

  get telemedicineLink(): TelemedicineLink {
    return this._telemedicineLink;
  }

  get slotId(): string {
    return this._slotId.value;
  }

  get patientId(): string {
    return this._patientId.value;
  }

  cancel(): void {
    this._status = "CANCELLED";
  }
}
