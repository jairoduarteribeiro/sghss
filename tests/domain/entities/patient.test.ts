import { Patient } from "@/domain/entities/patient";
import { Cpf } from "@/domain/value-objects/cpf";
import { Name } from "@/domain/value-objects/name";
import { Uuid } from "@/domain/value-objects/uuid";
import { describe, test, expect } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient entity", () => {
  test("Should create a Patient successfully", () => {
    const patient = Patient.from(
      Name.from("John Doe"),
      Cpf.from("70000000400"),
      Uuid.generate()
    );
    expect(patient.id).toMatch(UUID7_REGEX);
    expect(patient.name).toBe("John Doe");
    expect(patient.cpf).toBe("70000000400");
  });
});
