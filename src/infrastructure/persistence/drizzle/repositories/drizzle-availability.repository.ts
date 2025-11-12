import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../../application/ports/repositories/availability.repository";
import { Availability } from "../../../../domain/entities/availability";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { availabilities, slots } from "../schema";

@injectable()
export class DrizzleReadAvailabilityRepository implements IReadAvailabilityRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByDoctorId(doctorId: Uuid): Promise<Availability[]> {
    const results = await this.db.select().from(availabilities).where(eq(availabilities.doctorId, doctorId.value));
    return results.map((row) =>
      Availability.restore(Uuid.fromString(row.id), row.startDateTime, row.endDateTime, Uuid.fromString(row.doctorId)),
    );
  }
}

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
    for (const slot of availability.slots) {
      await this.db.insert(slots).values({
        id: slot.id,
        startDateTime: slot.startDateTime,
        endDateTime: slot.endDateTime,
        status: slot.status,
        availabilityId: slot.availabilityId,
      });
    }
  }
}
