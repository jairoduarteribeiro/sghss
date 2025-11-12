import { inject, injectable } from "inversify";
import { Availability } from "../../domain/entities/availability";
import { ValidationError } from "../../domain/errors/validation.error";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";
import type { IUnitOfWork } from "../ports/unit-of-work";

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
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}
  async execute(input: RegisterAvailabilityInput): Promise<RegisterAvailabilityOutput> {
    return this.unitOfWork.transaction(async (container) => {
      const availability = Availability.from(input.startDateTime, input.endDateTime, Uuid.fromString(input.doctorId));
      const readAvailabilityRepository = container.get<IReadAvailabilityRepository>(
        SYMBOLS.IReadAvailabilityRepository,
      );
      const existingAvailabilities = await readAvailabilityRepository.findByDoctorId(Uuid.fromString(input.doctorId));
      const hasOverlap = existingAvailabilities.some((existing) => existing.overlapsWith(availability));
      if (hasOverlap) {
        throw new ValidationError("The new availability overlaps with existing availabilities");
      }
      const writeAvailabilityRepository = container.get<IWriteAvailabilityRepository>(
        SYMBOLS.IWriteAvailabilityRepository,
      );
      await writeAvailabilityRepository.save(availability);
      return {
        availabilityId: availability.id,
        doctorId: availability.doctorId,
        startDateTime: availability.startDateTime,
        endDateTime: availability.endDateTime,
      };
    });
  }
}
