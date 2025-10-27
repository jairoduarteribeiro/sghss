import { Patient } from "@/domain/entities/patient";
import { DomainError } from "@/domain/errors/domain-error";
import { createPatientID } from "@/domain/types/id";
import { Password } from "@/domain/value-objects/password";
import { describe, test, expect } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient entity", () => {
  test("Should create a Patient if valid data is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const patient = await Patient.create(input);
    expect(patient.id).toMatch(UUID7_REGEX);
    expect(patient.name).toBe(input.name);
    expect(patient.email.value).toBe(input.email);
    expect(patient.cpf.value).toBe(input.cpf);
    expect(patient.password.hash.length).toBeGreaterThan(0);
    expect(patient.password.hash).not.toBe(input.password);
  });

  test("Should throw a DomainError if an invalid CPF is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "111.111.111-11",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    expect(Patient.create(input)).rejects.toThrow(DomainError);
  });

  test("Should throw a DomainError if an invalid email is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "invalid-email",
      password: "Password123!",
    };
    expect(Patient.create(input)).rejects.toThrow(DomainError);
  });

  test("Should throw a DomainError if an invalid password is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "invalid-password",
    };
    expect(Patient.create(input)).rejects.toThrow(DomainError);
  });

  test("Should hydrate a Patient instance from input data", async () => {
    const password = await Password.create("Password123!");
    const input = {
      id: createPatientID(),
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      passwordHash: password.hash,
    };
    const patient = Patient.hydrate(input);
    expect(patient.id).toBe(input.id);
    expect(patient.name).toBe(input.name);
    expect(patient.cpf.value).toBe(input.cpf);
    expect(patient.email.value).toBe(input.email);
    expect(patient.password.hash).toBe(password.hash);
    expect(await patient.password.verify("Password123!")).toBeTruthy();
    expect(await patient.password.verify("WrongPassword1!")).toBeFalsy();
  });
});
