import type { Availability } from "../../../domain/entities/availability";

export interface IWriteAvailabilityRepository {
  save(availability: Availability): Promise<void>;
}
