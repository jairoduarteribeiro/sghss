import { describe, expect, test } from "bun:test";
import { Availability } from "../../../src/domain/entities/availability";
import { Slot } from "../../../src/domain/entities/slot";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function splitAvailabilityIntoSlotsOf30Minutes(availability: Availability): void {
  const slotDurationInMs = 30 * 60 * 1000;
  let currentStart = new Date(availability.startDateTime);
  while (currentStart < availability.endDateTime) {
    const currentEnd = new Date(currentStart.getTime() + slotDurationInMs);
    if (currentEnd > availability.endDateTime) break;
    const slot = Slot.from(currentStart, currentEnd, Uuid.fromString(availability.id));
    availability.addSlot(slot);
    currentStart = currentEnd;
  }
}

describe("Availability - Entity", () => {
  test("Should create an Availability successfully with slots", () => {
    const startDateTime = new Date("2024-07-01T09:00:00Z");
    const endDateTime = new Date("2024-07-01T12:00:00Z");
    const doctorId = Uuid.generate();
    const availability = Availability.from(startDateTime, endDateTime, doctorId);
    splitAvailabilityIntoSlotsOf30Minutes(availability);
    expect(availability.id).toMatch(UUID7_REGEX);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
    expect(availability.slots.length).toBe(6);
  });

  test("Should restore an Availability successfully", () => {
    const id = Uuid.generate();
    const startDateTime = new Date("2024-07-01T09:00:00Z");
    const endDateTime = new Date("2024-07-01T17:00:00Z");
    const doctorId = Uuid.generate();
    const availability = Availability.restore(id, startDateTime, endDateTime, doctorId);
    splitAvailabilityIntoSlotsOf30Minutes(availability);
    expect(availability.id).toBe(id.value);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
    expect(availability.slots.length).toBe(16);
  });

  test("Should not allow endDateTime before startDateTime", () => {
    const act = () =>
      Availability.from(new Date("2024-07-01T17:00:00Z"), new Date("2024-07-01T09:00:00Z"), Uuid.generate());
    expect(act).toThrowError("End datetime must be after start datetime");
  });

  test("Should not allow different between startDateTime and endDateTime less than 30 minutes", () => {
    const act = () =>
      Availability.from(new Date("2024-07-01T09:00:00Z"), new Date("2024-07-01T09:15:00Z"), Uuid.generate());
    expect(act).toThrowError("End datetime must be more than 30 minutes after start datetime");
  });

  test("Should not allow times not multiples of 30 minutes", () => {
    const act = () =>
      Availability.from(new Date("2024-07-01T09:10:00Z"), new Date("2024-07-01T09:50:00Z"), Uuid.generate());
    expect(act).toThrowError("Start datetime and end datetime must be in multiples of 30 minutes");
  });

  test("Should not allow availability more than 4 hours", () => {
    const act = () =>
      Availability.from(new Date("2024-07-01T09:00:00Z"), new Date("2024-07-01T14:30:00Z"), Uuid.generate());
    expect(act).toThrowError("Availability cannot exceed 4 hours");
  });
});
