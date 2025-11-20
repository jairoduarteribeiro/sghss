import { describe, expect, test } from "bun:test";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Appointment - Entity", () => {
  test("Should create an in person Appointment successfully", () => {
    const slotId = Uuid.generate();
    const patientId = Uuid.generate();
    const appointment = Appointment.from({ slotId, patientId, modality: "IN_PERSON" });
    expect(appointment.id).toMatch(UUID7_REGEX);
    expect(appointment.status).toBe("SCHEDULED");
    expect(appointment.modality).toBe("IN_PERSON");
    expect(appointment.telemedicineLink).toBeNull();
    expect(appointment.slotId).toBe(slotId.value);
    expect(appointment.patientId).toBe(patientId.value);
  });

  test("Should create a telemedicine Appointment successfully", () => {
    const slotId = Uuid.generate();
    const patientId = Uuid.generate();
    const telemedicineLink = "https://vidaplus.com/meet/abc123";
    const appointment = Appointment.from({ slotId, patientId, modality: "TELEMEDICINE", telemedicineLink });
    expect(appointment.id).toMatch(UUID7_REGEX);
    expect(appointment.status).toBe("SCHEDULED");
    expect(appointment.modality).toBe("TELEMEDICINE");
    expect(appointment.telemedicineLink).toBe(telemedicineLink);
    expect(appointment.slotId).toBe(slotId.value);
    expect(appointment.patientId).toBe(patientId.value);
  });

  test("Should restore an Appointment successfully", () => {
    const id = Uuid.generate();
    const status = "COMPLETED";
    const modality = "TELEMEDICINE";
    const telemedicineLink = "https://vidaplus.com/meet/xyz789";
    const slotId = Uuid.generate();
    const patientId = Uuid.generate();
    const appointment = Appointment.restore({ id, status, modality, telemedicineLink, slotId, patientId });
    expect(appointment.id).toBe(id.value);
    expect(appointment.status).toBe(status);
    expect(appointment.modality).toBe(modality);
    expect(appointment.telemedicineLink).toBe(telemedicineLink);
    expect(appointment.slotId).toBe(slotId.value);
    expect(appointment.patientId).toBe(patientId.value);
  });
});
