import { Uuid } from "../value-objects/uuid";

type SlotStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

type SlotRestoreProps = {
  id: Uuid;
  startDateTime: Date;
  endDateTime: Date;
  status: SlotStatus;
  availabilityId: Uuid;
};

type SlotCreateProps = {
  startDateTime: Date;
  endDateTime: Date;
  availabilityId: Uuid;
  status?: SlotStatus;
};

export class Slot {
  private constructor(
    private readonly _id: Uuid,
    private readonly _startDateTime: Date,
    private readonly _endDateTime: Date,
    private _status: SlotStatus,
    private readonly _availabilityId: Uuid,
  ) {}

  static from(props: SlotCreateProps): Slot {
    return new Slot(
      Uuid.generate(),
      props.startDateTime,
      props.endDateTime,
      props.status ?? "AVAILABLE",
      props.availabilityId,
    );
  }

  static restore(props: SlotRestoreProps): Slot {
    return new Slot(props.id, props.startDateTime, props.endDateTime, props.status, props.availabilityId);
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
