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
    if (!Availability.isMultipleOf30Minutes(startDateTime) || !Availability.isMultipleOf30Minutes(endDateTime)) {
      throw new ValidationError("Start datetime and end datetime must be in multiples of 30 minutes");
    }
    if (!Availability.isDurationAtMost4Hours(startDateTime, endDateTime)) {
      throw new ValidationError("Availability cannot exceed 4 hours");
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

  overlapsWith(other: Availability): boolean {
    return this._startDateTime < other._endDateTime && this._endDateTime > other._startDateTime;
  }
}
