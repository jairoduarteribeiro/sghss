import type { Availability } from "../../../domain/entities/availability";
import type { Uuid } from "../../../domain/value-objects/uuid";

export interface IReadAvailabilityRepository {
  findByDoctorId(doctorId: Uuid): Promise<Availability[]>;
}

export interface IWriteAvailabilityRepository {
  save(availability: Availability): Promise<void>;
}
