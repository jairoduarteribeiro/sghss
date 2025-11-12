import { describe, expect, test } from "bun:test";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Appointment - Entity", () => {
  test("Should create an in person Appointment successfully", () => {
    const slotId = Uuid.generate();
    const patientId = Uuid.generate();
    const appointment = Appointment.inPerson(slotId, patientId);
    expect(appointment.id).toMatch(UUID7_REGEX);
    expect(appointment.status).toBe("SCHEDULED");
    expect(appointment.modality).toBe("IN_PERSON");
    expect(appointment.telemedicineLink).toBeNull();
    expect(appointment.slotId).toBe(slotId.value);
    expect(appointment.patientId).toBe(patientId.value);
  });
});
