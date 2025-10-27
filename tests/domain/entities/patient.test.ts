import { Patient } from "@/domain/entities/patient";
import { describe, test, expect } from "bun:test";

describe("Patient entity", () => {
  test("Should create a Patient if valid data is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const patient = await Patient.create(input);
    expect(patient.id.length).toBeGreaterThan(0);
    expect(patient.name).toBe(input.name);
    expect(patient.email.value).toBe(input.email);
    expect(patient.cpf.value).toBe(input.cpf);
    expect(patient.password.hash.length).toBeGreaterThan(0);
    expect(patient.password.hash).not.toBe(input.password);
  });
});
