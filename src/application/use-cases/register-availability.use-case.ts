import { inject, injectable } from "inversify";
import { Availability } from "../../domain/entities/availability";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../ports/repositories/availability.repository";

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
    @inject(SYMBOLS.IWriteAvailabilityRepository)
    private readonly writeAvailabilityRepository: IWriteAvailabilityRepository,
  ) {}
  async execute(input: RegisterAvailabilityInput): Promise<RegisterAvailabilityOutput> {
    const availability = Availability.from(input.startDateTime, input.endDateTime, Uuid.fromString(input.doctorId));
    await this.writeAvailabilityRepository.save(availability);
    return {
      availabilityId: availability.id,
      doctorId: availability.doctorId,
      startDateTime: availability.startDateTime,
      endDateTime: availability.endDateTime,
    };
  }
}
