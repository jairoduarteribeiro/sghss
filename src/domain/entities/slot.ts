import { Uuid } from "../value-objects/uuid";

type SlotStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

export class Slot {
  private constructor(
    private readonly _id: Uuid,
    private readonly _startDateTime: Date,
    private readonly _endDateTime: Date,
    private _status: SlotStatus,
    private readonly _availabilityId: Uuid,
  ) {}

  static from(startDateTime: Date, endDateTime: Date, availabilityId: Uuid): Slot {
    return new Slot(Uuid.generate(), startDateTime, endDateTime, "AVAILABLE", availabilityId);
  }

  static restore(id: Uuid, startDateTime: Date, endDateTime: Date, status: SlotStatus, availabilityId: Uuid): Slot {
    return new Slot(id, startDateTime, endDateTime, status, availabilityId);
  }

  get id(): string {
    return this._id.value;
  }

  get startDateTime(): Date {
    return this._startDateTime;
  }

  get endDateTime(): Date {
    return this._endDateTime;
  }

  get status(): SlotStatus {
    return this._status;
  }

  get availabilityId(): string {
    return this._availabilityId.value;
  }

  book(): void {
    this._status = "BOOKED";
  }

  makeAvailable(): void {
    this._status = "AVAILABLE";
  }
}
