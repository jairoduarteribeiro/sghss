import { describe, expect, test } from "bun:test";
import { Availability } from "../../../src/domain/entities/availability";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Availability entity", () => {
  test("Should create an Availability successfully", () => {
    const startDateTime = new Date("2024-07-01T09:00:00Z");
    const endDateTime = new Date("2024-07-01T17:00:00Z");
    const doctorId = Uuid.generate();
    const availability = Availability.from(startDateTime, endDateTime, doctorId);
    expect(availability.id).toMatch(UUID7_REGEX);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
  });

  test("Should restore an Availability successfully", () => {
    const id = Uuid.generate();
    const startDateTime = new Date("2024-07-01T09:00:00Z");
    const endDateTime = new Date("2024-07-01T17:00:00Z");
    const doctorId = Uuid.generate();
    const availability = Availability.restore(id, startDateTime, endDateTime, doctorId);
    expect(availability.id).toBe(id.value);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
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
});
