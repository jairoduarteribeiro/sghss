import { DomainValidationError } from "../errors/domain-validation.error";
import { Uuid } from "../value-objects/uuid";
import { Slot } from "./slot";

const SLOT_DURATION_MINUTES = 30;
const MS_IN_A_MINUTE = 60 * 1000;

type AvailabilityCreateProps = {
  startDateTime: Date;
  endDateTime: Date;
  doctorId: Uuid;
};

type AvailabilityRestoreProps = {
  id: Uuid;
  startDateTime: Date;
  endDateTime: Date;
  doctorId: Uuid;
  slots: Slot[];
};

export class Availability {
  private constructor(
    private readonly _id: Uuid,
    private readonly _startDateTime: Date,
    private readonly _endDateTime: Date,
    private readonly _doctorId: Uuid,
    private readonly _slots: Slot[] = [],
  ) {}

  static from(props: AvailabilityCreateProps): Availability {
    Availability.validateDates(props.startDateTime, props.endDateTime);
    const availabilityId = Uuid.generate();
    const slots = Availability.generateSlots(props.startDateTime, props.endDateTime, availabilityId);
    return new Availability(availabilityId, props.startDateTime, props.endDateTime, props.doctorId, slots);
  }

  static restore(props: AvailabilityRestoreProps): Availability {
    return new Availability(props.id, props.startDateTime, props.endDateTime, props.doctorId, props.slots);
  }

  private static validateDates(startDateTime: Date, endDateTime: Date): void {
    if (Availability.isStartInThePast(startDateTime)) {
      throw new DomainValidationError("Start datetime cannot be in the past");
    }
    if (!Availability.isStartBeforeEnd(startDateTime, endDateTime)) {
      throw new DomainValidationError("End datetime must be after start datetime");
    }
    if (!Availability.isDurationAtLeast30Minutes(startDateTime, endDateTime)) {
      throw new DomainValidationError("End datetime must be more than 30 minutes after start datetime");
    }
    if (!Availability.isMultipleOf30Minutes(startDateTime) || !Availability.isMultipleOf30Minutes(endDateTime)) {
      throw new DomainValidationError("Start datetime and end datetime must be in multiples of 30 minutes");
    }
    if (!Availability.isDurationAtMost4Hours(startDateTime, endDateTime)) {
      throw new DomainValidationError("Availability cannot exceed 4 hours");
    }
  }

  private static isStartInThePast(startDateTime: Date): boolean {
    const now = new Date();
    return startDateTime < now;
  }

  private static isStartBeforeEnd(startDateTime: Date, endDateTime: Date): boolean {
    return startDateTime < endDateTime;
  }

  private static isDurationAtLeast30Minutes(startDateTime: Date, endDateTime: Date): boolean {
    const diffInMs = endDateTime.getTime() - startDateTime.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    return diffInMinutes >= 30;
  }

  private static isMultipleOf30Minutes(dateTime: Date): boolean {
    const minutes = dateTime.getUTCMinutes();
    return minutes % 30 === 0;
  }

  private static isDurationAtMost4Hours(startDateTime: Date, endDateTime: Date): boolean {
    const diffInMs = endDateTime.getTime() - startDateTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours <= 4;
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

  get doctorId(): string {
    return this._doctorId.value;
  }

  get slots(): Slot[] {
    return this._slots;
  }

  overlapsWith(other: Availability): boolean {
    return this._startDateTime < other._endDateTime && this._endDateTime > other._startDateTime;
  }

  private static generateSlots(startDateTime: Date, endDateTime: Date, availabilityId: Uuid): Slot[] {
    const slotDurationInMs = SLOT_DURATION_MINUTES * MS_IN_A_MINUTE;
    const start = startDateTime.getTime();
    const end = endDateTime.getTime();
    const slots: Slot[] = [];
    for (let time = start; time < end; time += slotDurationInMs) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + slotDurationInMs);
      const slot = Slot.from({
        startDateTime: slotStart,
        endDateTime: slotEnd,
        availabilityId: availabilityId,
      });
      slots.push(slot);
    }
    return slots;
  }

  bookSlot(slotId: Uuid): void {
    const slot = this._slots.find((s) => s.id === slotId.value);
    slot?.book();
  }

  isSlotAvailable(slotId: Uuid): boolean {
    const slot = this._slots.find((s) => s.id === slotId.value);
    return slot?.status === "AVAILABLE";
  }

  makeSlotAvailable(slotId: Uuid): void {
    const slot = this._slots.find((s) => s.id === slotId.value);
    slot?.makeAvailable();
  }
}
