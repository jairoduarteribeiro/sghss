import { describe, expect, test } from "bun:test";
import { Availability } from "../../../src/domain/entities/availability";
import { Slot } from "../../../src/domain/entities/slot";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { DateBuilder } from "../../utils/date-builder";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Availability - Entity", () => {
  test("Should create an Availability successfully with slots", () => {
    const startDateTime = DateBuilder.tomorrow().withTime(9, 0).build();
    const endDateTime = DateBuilder.tomorrow().withTime(12, 0).build();
    const doctorId = Uuid.generate();
    const availability = Availability.from({ startDateTime, endDateTime, doctorId });
    expect(availability.id).toMatch(UUID7_REGEX);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
    expect(availability.slots).toHaveLength(6);
  });

  test("Should restore an Availability successfully", () => {
    const id = Uuid.generate();
    const startDateTime = DateBuilder.tomorrow().withTime(9, 0).build();
    const endDateTime = DateBuilder.tomorrow().withTime(10, 0).build();
    const doctorId = Uuid.generate();
    const slots: Slot[] = [
      Slot.from({
        startDateTime: startDateTime,
        endDateTime: DateBuilder.tomorrow().withTime(9, 30).build(),
        availabilityId: id,
      }),
      Slot.from({
        startDateTime: DateBuilder.tomorrow().withTime(9, 30).build(),
        endDateTime: endDateTime,
        availabilityId: id,
      }),
    ];
    const availability = Availability.restore({ id, startDateTime, endDateTime, doctorId, slots });
    expect(availability.id).toBe(id.value);
    expect(availability.startDateTime).toBe(startDateTime);
    expect(availability.endDateTime).toBe(endDateTime);
    expect(availability.doctorId).toBe(doctorId.value);
    expect(availability.slots).toHaveLength(2);
  });

  test("Should not allow startDateTime in the past", () => {
    const startDateTime = DateBuilder.now().minusDays(1).withTime(9, 0).build();
    const endDateTime = DateBuilder.now().minusDays(1).withTime(10, 0).build();
    const act = () =>
      Availability.from({
        startDateTime,
        endDateTime,
        doctorId: Uuid.generate(),
      });
    expect(act).toThrowError("Start datetime cannot be in the past");
  });

  test("Should not allow endDateTime before startDateTime", () => {
    const act = () =>
      Availability.from({
        startDateTime: DateBuilder.tomorrow().withTime(10, 0).build(),
        endDateTime: DateBuilder.tomorrow().withTime(9, 0).build(),
        doctorId: Uuid.generate(),
      });
    expect(act).toThrowError("End datetime must be after start datetime");
  });

  test("Should not allow different between startDateTime and endDateTime less than 30 minutes", () => {
    const act = () =>
      Availability.from({
        startDateTime: DateBuilder.tomorrow().withTime(9, 0).build(),
        endDateTime: DateBuilder.tomorrow().withTime(9, 15).build(),
        doctorId: Uuid.generate(),
      });
    expect(act).toThrowError("End datetime must be more than 30 minutes after start datetime");
  });

  test("Should not allow times not multiples of 30 minutes", () => {
    const act = () =>
      Availability.from({
        startDateTime: DateBuilder.tomorrow().withTime(9, 10).build(),
        endDateTime: DateBuilder.tomorrow().withTime(9, 50).build(),
        doctorId: Uuid.generate(),
      });
    expect(act).toThrowError("Start datetime and end datetime must be in multiples of 30 minutes");
  });

  test("Should not allow availability more than 4 hours", () => {
    const act = () =>
      Availability.from({
        startDateTime: DateBuilder.tomorrow().withTime(9, 0).build(),
        endDateTime: DateBuilder.tomorrow().withTime(14, 30).build(),
        doctorId: Uuid.generate(),
      });
    expect(act).toThrowError("Availability cannot exceed 4 hours");
  });
});
