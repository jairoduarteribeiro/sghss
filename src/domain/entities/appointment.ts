import { Uuid } from "../value-objects/uuid";

type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type AppointmentModality = "IN_PERSON" | "TELEMEDICINE";
type TelemedicineLink = string | null;

export class Appointment {
  private constructor(
    private readonly _id: Uuid,
    private readonly _status: AppointmentStatus,
    private readonly _modality: AppointmentModality,
    private readonly _telemedicineLink: TelemedicineLink,
    private readonly _slotId: Uuid,
    private readonly _patientId: Uuid,
  ) {}

  static inPerson(slotId: Uuid, patientId: Uuid): Appointment {
    return new Appointment(Uuid.generate(), "SCHEDULED", "IN_PERSON", null, slotId, patientId);
  }

  static telemedicine(slotId: Uuid, patientId: Uuid, telemedicineLink: TelemedicineLink): Appointment {
    return new Appointment(Uuid.generate(), "SCHEDULED", "TELEMEDICINE", telemedicineLink, slotId, patientId);
  }

  static restore(
    id: Uuid,
    status: AppointmentStatus,
    modality: AppointmentModality,
    telemedicineLink: TelemedicineLink,
    slotId: Uuid,
    patientId: Uuid,
  ): Appointment {
    return new Appointment(id, status, modality, telemedicineLink, slotId, patientId);
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
}
