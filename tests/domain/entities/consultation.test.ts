import { describe, expect, test } from "bun:test";
import { Consultation } from "../../../src/domain/entities/consultation";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Consultation - Entity", () => {
  test("Should create a Consultation successfully", () => {
    const appointmentId = Uuid.generate();
    const consultation = Consultation.from({
      appointmentId,
      notes: "Patient reports mild chest pain.",
      diagnosis: "Suspected angina.",
      prescription: "Aspirin 100mg daily.",
      referral: "Cardiology specialist consultation.",
    });
    expect(consultation.id).toMatch(UUID7_REGEX);
    expect(consultation.appointmentId).toBe(appointmentId.value);
    expect(consultation.notes).toBe("Patient reports mild chest pain.");
    expect(consultation.diagnosis).toBe("Suspected angina.");
    expect(consultation.prescription).toBe("Aspirin 100mg daily.");
    expect(consultation.referral).toBe("Cardiology specialist consultation.");
  });

  test("Should create a Consultation with optional fields as null", () => {
    const appointmentId = Uuid.generate();
    const consultation = Consultation.from({ appointmentId });
    expect(consultation.id).toMatch(UUID7_REGEX);
    expect(consultation.appointmentId).toBe(appointmentId.value);
    expect(consultation.notes).toBeNull();
    expect(consultation.diagnosis).toBeNull();
    expect(consultation.prescription).toBeNull();
    expect(consultation.referral).toBeNull();
  });

  test("Should restore a Consultation successfully", () => {
    const id = Uuid.generate();
    const appointmentId = Uuid.generate();
    const consultation = Consultation.restore({
      id,
      appointmentId,
      notes: "Follow-up consultation notes.",
      diagnosis: "Condition improved.",
      prescription: "Continue current medication.",
      referral: "No further referral needed.",
    });
    expect(consultation.id).toBe(id.value);
    expect(consultation.appointmentId).toBe(appointmentId.value);
    expect(consultation.notes).toBe("Follow-up consultation notes.");
    expect(consultation.diagnosis).toBe("Condition improved.");
    expect(consultation.prescription).toBe("Continue current medication.");
    expect(consultation.referral).toBe("No further referral needed.");
  });
});
