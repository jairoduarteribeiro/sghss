import { describe, expect, test } from "bun:test";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";

describe("Medical Specialty - Value Object", () => {
  test("Should create a valid MedicalSpecialty", () => {
    const medicalSpecialty = MedicalSpecialty.from("Cardiology");
    expect(medicalSpecialty.value).toBe("Cardiology");
  });

  test("Should trim and normalize a MedicalSpecialty", () => {
    const medicalSpecialty = MedicalSpecialty.from("   Pulmonary   Disease   and   Critical   Care   Medicine   ");
    expect(medicalSpecialty.value).toBe("Pulmonary Disease and Critical Care Medicine");
  });

  test.each(["a", "a".repeat(51)])(
    "Should not create a MedicalSpecialty with invalid length - %s",
    (invalidSpecialty) => {
      const act = () => MedicalSpecialty.from(invalidSpecialty);
      expect(act).toThrowError("Medical specialty must have length between 2 and 50");
    },
  );
});
