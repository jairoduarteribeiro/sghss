import { Patient } from "@/domain/entities/patient";
import { createPatientID } from "@/domain/types/id";
import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { describe, test, expect } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient entity", async () => {
  test("Should create a Patient if valid data is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: new Cpf("70000000400"),
      email: new Email("john.doe@example.com"),
      password: await Password.create("Password123!"),
    };
    const patient = Patient.create(input);
    expect(patient.id).toMatch(UUID7_REGEX);
    expect(patient.name).toBe(input.name);
    expect(patient.email).toEqual(input.email);
    expect(patient.cpf).toEqual(input.cpf);
    expect(patient.password).toEqual(input.password);
  });

  test("Should hydrate a Patient instance from input data", () => {
    const input = {
      id: createPatientID(),
      name: "John Doe",
      cpf: new Cpf("70000000400"),
      email: new Email("john.doe@example.com"),
      password: Password.hydrate("hashed-password"),
    };
    const patient = Patient.hydrate(input);
    expect(patient.id).toBe(input.id);
    expect(patient.name).toBe(input.name);
    expect(patient.cpf).toEqual(input.cpf);
    expect(patient.email).toEqual(input.email);
    expect(patient.password).toEqual(input.password);
  });
});
