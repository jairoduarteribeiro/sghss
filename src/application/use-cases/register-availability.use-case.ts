import { inject, injectable } from "inversify";
import { Availability } from "../../domain/entities/availability";
import { Slot } from "../../domain/entities/slot";
import { DomainConflictError } from "../../domain/errors/domain-conflict.error";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";

type SlotOutput = {
  slotId: string;
  startDateTime: Date;
  endDateTime: Date;
  status: "AVAILABLE" | "BOOKED" | "CANCELLED";
};

type RegisterAvailabilityInput = {
  doctorId: string;
  startDateTime: Date;
  endDateTime: Date;
};

type RegisterAvailabilityOutput = {
  availabilityId: string;
  doctorId: string;
  startDateTime: Date;
  endDateTime: Date;
  slots: SlotOutput[];
};

@injectable()
export class RegisterAvailabilityUseCase {
  constructor(
    @inject(SYMBOLS.IReadAvailabilityRepository)
    private readonly readAvailabilityRepository: IReadAvailabilityRepository,
    @inject(SYMBOLS.IWriteAvailabilityRepository)
    private readonly writeAvailabilityRepository: IWriteAvailabilityRepository,
  ) {}

  async execute(input: RegisterAvailabilityInput): Promise<RegisterAvailabilityOutput> {
    const availability = Availability.from(input.startDateTime, input.endDateTime, Uuid.fromString(input.doctorId));
    const existingAvailabilities = await this.readAvailabilityRepository.findByDoctorId(
      Uuid.fromString(input.doctorId),
    );
    const hasOverlap = existingAvailabilities.some((existing) => existing.overlapsWith(availability));
    if (hasOverlap) {
      throw new DomainConflictError("The new availability overlaps with existing availabilities");
    }
    this.addSlotsToAvailability(availability);
    await this.writeAvailabilityRepository.save(availability);
    return {
      availabilityId: availability.id,
      doctorId: availability.doctorId,
      startDateTime: availability.startDateTime,
      endDateTime: availability.endDateTime,
      slots: availability.slots.map((slot) => ({
        slotId: slot.id,
        startDateTime: slot.startDateTime,
        endDateTime: slot.endDateTime,
        status: slot.status,
      })),
    };
  }

  private addSlotsToAvailability(availability: Availability): void {
    const slotDurationInMinutes = 30;
    const slotDurationInMs = slotDurationInMinutes * 60 * 1000;
    const start = availability.startDateTime.getTime();
    const end = availability.endDateTime.getTime();
    for (let time = start; time < end; time += slotDurationInMs) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + slotDurationInMs);
      const slot = Slot.from(slotStart, slotEnd, Uuid.fromString(availability.id));
      availability.addSlot(slot);
    }
  }
}
