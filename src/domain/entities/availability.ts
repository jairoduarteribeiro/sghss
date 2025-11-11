import { ValidationError } from "../errors/validation.error";
import { Uuid } from "../value-objects/uuid";

export class Availability {
  private constructor(
    private readonly _id: Uuid,
    private readonly _startDateTime: Date,
    private readonly _endDateTime: Date,
    private readonly _doctorId: Uuid,
  ) {}

  static from(startDateTime: Date, endDateTime: Date, doctorId: Uuid): Availability {
    Availability.validateDates(startDateTime, endDateTime);
    return new Availability(Uuid.generate(), startDateTime, endDateTime, doctorId);
  }

  static restore(id: Uuid, startDateTime: Date, endDateTime: Date, doctorId: Uuid): Availability {
    return new Availability(id, startDateTime, endDateTime, doctorId);
  }

  private static validateDates(startDateTime: Date, endDateTime: Date): void {
    if (!Availability.isStartBeforeEnd(startDateTime, endDateTime)) {
      throw new ValidationError("End datetime must be after start datetime");
    }
    if (!Availability.isDurationAtLeast30Minutes(startDateTime, endDateTime)) {
      throw new ValidationError("End datetime must be more than 30 minutes after start datetime");
    }
  }

  private static isStartBeforeEnd(startDateTime: Date, endDateTime: Date): boolean {
    return startDateTime < endDateTime;
  }

  private static isDurationAtLeast30Minutes(startDateTime: Date, endDateTime: Date): boolean {
    const diffInMs = endDateTime.getTime() - startDateTime.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    return diffInMinutes >= 30;
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
}
