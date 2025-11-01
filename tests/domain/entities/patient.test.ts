import { Patient } from "@/domain/entities/patient";
import { DomainError } from "@/domain/errors/domain-error";
import { describe, test, expect } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient entity", () => {
  test("Should create a Patient if a valid data is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const patient = await Patient.create(input);
    expect(patient.id).toMatch(UUID7_REGEX);
    expect(patient.name).toBe(input.name);
    expect(patient.cpf).toBe(input.cpf);
    expect(patient.email).toBe(input.email);
    expect(patient.verifyPassword(input.password)).resolves.toBeTruthy();
    expect(patient.verifyPassword("WrongPassword1!")).resolves.toBeFalsy();
  });

  test("Should hydrate a Patient instance from input data", async () => {
    const input = {
      id: "some-id",
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      passwordHash: "some-hash",
    };
    const patient = Patient.hydrate(input);
    expect(patient.id).toBe(input.id);
    expect(patient.name).toBe(input.name);
    expect(patient.cpf).toBe(input.cpf);
    expect(patient.email).toBe(input.email);
    expect(patient.passwordHash).toBe(input.passwordHash);
  });

  test("Should throw a DomainError if an invalid data is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "111.111.111-11",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    expect(Patient.create(input)).rejects.toThrow(DomainError);
  });
});
