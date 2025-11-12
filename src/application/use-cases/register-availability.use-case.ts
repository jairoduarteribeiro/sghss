import { inject, injectable } from "inversify";
import { Availability } from "../../domain/entities/availability";
import { ValidationError } from "../../domain/errors/validation.error";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";

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
    if (await this.isOverlappingAvailability(availability)) {
      throw new ValidationError("The availability overlaps with an existing availability");
    }
    await this.writeAvailabilityRepository.save(availability);
    return {
      availabilityId: availability.id,
      doctorId: availability.doctorId,
      startDateTime: availability.startDateTime,
      endDateTime: availability.endDateTime,
    };
  }

  private async isOverlappingAvailability(availability: Availability): Promise<boolean> {
    const existingAvailabilities = await this.readAvailabilityRepository.findByDoctorId(
      Uuid.fromString(availability.doctorId),
    );
    return existingAvailabilities.some((existing) => existing.overlapsWith(availability));
  }
}
