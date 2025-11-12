import { Uuid } from "../value-objects/uuid";

export class Slot {
  private constructor(
    private readonly _id: Uuid,
    private readonly _startDateTime: Date,
    private readonly _endDateTime: Date,
    private readonly _availabilityId: Uuid,
  ) {}

  static from(startDateTime: Date, endDateTime: Date, availabilityId: Uuid): Slot {
    return new Slot(Uuid.generate(), startDateTime, endDateTime, availabilityId);
  }

  static restore(id: Uuid, startDateTime: Date, endDateTime: Date, availabilityId: Uuid): Slot {
    return new Slot(id, startDateTime, endDateTime, availabilityId);
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

  get availabilityId(): string {
    return this._availabilityId.value;
  }
}
