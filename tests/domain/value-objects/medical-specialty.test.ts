import { describe, expect, test } from "bun:test";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";

describe("Medical Specialty - Value Object", () => {
  test("Should create a valid MedicalSpecialty", () => {
    const medicalSpecialty = MedicalSpecialty.from("Cardiology");
    expect(medicalSpecialty.value).toBe("Cardiology");
  });
});
