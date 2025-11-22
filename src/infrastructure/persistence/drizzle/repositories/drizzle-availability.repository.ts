import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../../application/ports/repositories/availability.repository";
import { Availability } from "../../../../domain/entities/availability";
import { Slot } from "../../../../domain/entities/slot";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { availabilities, slots } from "../schema";

@injectable()
export class DrizzleReadAvailabilityRepository implements IReadAvailabilityRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByDoctorId(doctorId: Uuid): Promise<Availability[]> {
    const rows = await this.db.query.availabilities.findMany({
      where: eq(availabilities.doctorId, doctorId.value),
      with: {
        slots: true,
      },
    });
    return rows.map((row) => {
      const slots = row.slots.map((slot) =>
        Slot.restore({
          id: Uuid.fromString(slot.id),
          startDateTime: new Date(slot.startDateTime),
          endDateTime: new Date(slot.endDateTime),
          status: slot.status,
          availabilityId: Uuid.fromString(slot.availabilityId),
        }),
      );
      return Availability.restore({
        id: Uuid.fromString(row.id),
        startDateTime: new Date(row.startDateTime),
        endDateTime: new Date(row.endDateTime),
        doctorId: Uuid.fromString(row.doctorId),
        slots: slots,
      });
    });
  }

  async findBySlotId(slotId: Uuid): Promise<Availability | null> {
    const row = await this.db.query.slots.findFirst({
      where: eq(slots.id, slotId.value),
      with: {
        availability: {
          with: {
            slots: true,
          },
        },
      },
    });
    if (!row || !row.availability) {
      return null;
    }
    const availabilityRow = row.availability;
    const availabilitySlots = availabilityRow.slots.map((slot) =>
      Slot.restore({
        id: Uuid.fromString(slot.id),
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
        status: slot.status,
        availabilityId: Uuid.fromString(slot.availabilityId),
      }),
    );
    return Availability.restore({
      id: Uuid.fromString(availabilityRow.id),
      startDateTime: new Date(availabilityRow.startDateTime),
      endDateTime: new Date(availabilityRow.endDateTime),
      doctorId: Uuid.fromString(availabilityRow.doctorId),
      slots: availabilitySlots,
    });
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

  async update(availability: Availability): Promise<void> {
    await this.db
      .update(availabilities)
      .set({
        startDateTime: availability.startDateTime,
        endDateTime: availability.endDateTime,
      })
      .where(eq(availabilities.id, availability.id));
    for (const slot of availability.slots) {
      await this.db
        .update(slots)
        .set({
          startDateTime: slot.startDateTime,
          endDateTime: slot.endDateTime,
          status: slot.status,
        })
        .where(eq(slots.id, slot.id));
    }
  }

  async clear(): Promise<void> {
    await this.db.delete(availabilities);
  }
}
