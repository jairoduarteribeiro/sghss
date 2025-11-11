import { describe, expect, test } from "bun:test";
import { Patient } from "../../../src/domain/entities/patient";
import { Cpf } from "../../../src/domain/value-objects/cpf";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient entity", () => {
  test("Should create a Patient successfully", () => {
    const name = Name.from("John Doe");
    const cpf = Cpf.from("70000000400");
    const userId = Uuid.generate();
    const patient = Patient.from(name, cpf, userId);
    expect(patient.id).toMatch(UUID7_REGEX);
    expect(patient.name).toBe(name.value);
    expect(patient.cpf).toBe(cpf.value);
    expect(patient.userId).toBe(userId.value);
  });

  test("Should restore a Patient successfully", () => {
    const id = Uuid.generate();
    const name = Name.from("John Doe");
    const cpf = Cpf.from("70000000400");
    const userId = Uuid.generate();
    const patient = Patient.restore(id, name, cpf, userId);
    expect(patient.id).toBe(id.value);
    expect(patient.name).toBe(name.value);
    expect(patient.cpf).toBe(cpf.value);
    expect(patient.userId).toBe(userId.value);
  });
});
