import { describe, expect, test } from "bun:test";
import { Availability } from "../../../src/domain/entities/availability";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Availability entity", () => {
  test("Should create an Availability successfully", () => {
    const startDateTime = new Date("2024-07-01T09:00:00Z");
    const endDateTime = new Date("2024-07-01T17:00:00Z");
    const doctorId = Uuid.generate();
    const availability = Availability.from(
      startDateTime,
      endDateTime,
      doctorId,
    );
    expect(availability.id).toMatch(UUID7_REGEX);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
  });
});
