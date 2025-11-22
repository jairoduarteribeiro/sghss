import { inject, injectable } from "inversify";
import { Availability } from "../../domain/entities/availability";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import { ConflictError } from "../errors/conflict.error";
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
    const availability = Availability.from({
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      doctorId: Uuid.fromString(input.doctorId),
    });
    const existingAvailabilities = await this.readAvailabilityRepository.findByDoctorId(
      Uuid.fromString(input.doctorId),
    );
    if (RegisterAvailabilityUseCase.hasOverlap(availability, existingAvailabilities)) {
      throw new ConflictError("The new availability overlaps with existing availabilities");
    }
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

  private static hasOverlap(availability: Availability, existingAvailabilities: Availability[]): boolean {
    return existingAvailabilities.some((existing) => existing.overlapsWith(availability));
  }
}
