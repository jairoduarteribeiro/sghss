import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../../../../application/ports/repositories/availability.repository";
import type { Availability } from "../../../../domain/entities/availability";
import type { DbClient } from "../drizzle-client";
import { availabilities } from "../schema";

@injectable()
export class DrizzleWriteAvailabilityRepository implements IWriteAvailabilityRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(availability: Availability): Promise<void> {
    await this.db.insert(availabilities).values({
      id: availability.id,
      startDateTime: availability.startDateTime,
      endDateTime: availability.endDateTime,
      doctorId: availability.doctorId,
    });
  }
}
