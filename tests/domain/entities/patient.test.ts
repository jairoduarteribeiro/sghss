import { Patient } from "@/domain/entities/patient";
import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { describe, test, expect } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient entity", () => {
  test("Should create a Patient successfully", async () => {
    const patient = Patient.from(
      "John Doe",
      Cpf.from("70000000400"),
      Email.from("john.doe@example.com"),
      await Password.from("Password123!")
    );
    expect(patient.id).toMatch(UUID7_REGEX);
    expect(patient.name).toBe("John Doe");
    expect(patient.cpf).toBe("70000000400");
    expect(patient.email).toBe("john.doe@example.com");
    expect(patient.verifyPassword("Password123!")).resolves.toBeTruthy();
    expect(patient.verifyPassword("WrongPassword1!")).resolves.toBeFalsy();
  });
});
