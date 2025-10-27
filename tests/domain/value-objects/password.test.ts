import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";
import { Password } from "@/domain/value-objects/password";
import { describe, test, expect } from "bun:test";

describe("Password value object", () => {
  test.each(["Pass123!", "LongPass!1234567890"])(
    "Should create and successfully verify a valid password (%s)",
    async (validPassword) => {
      const password = await Password.create(validPassword);
      expect(password.hash).toBeString();
      expect(password.hash).not.toBe("");
      expect(password.hash).not.toBe(validPassword);
      const passwordFromDatabase = Password.hydrate(password.hash);
      expect(await passwordFromDatabase.verify(validPassword)).toBeTrue();
      expect(await passwordFromDatabase.verify("WrongPassword1!")).toBeFalse();
    }
  );

  test.each(["Short1!", "ThisIsWayTooLongPass1!"])(
    "Should not create a Password if length is invalid (%s)",
    async (invalidPassword) => {
      expect(Password.create(invalidPassword)).rejects.toThrow(
        new DomainError(VALIDATION_MESSAGES.PASSWORD_INVALID_LENGTH)
      );
    }
  );

  test.each(["password123!", "PASSWORD123!", "PasswordAbc!", "Password123"])(
    "Should not create a Password if complexity is not met (%s)",
    async (invalidPassword) => {
      expect(Password.create(invalidPassword)).rejects.toThrow(
        new DomainError(VALIDATION_MESSAGES.PASSWORD_DOES_NOT_MEET_COMPLEXITY)
      );
    }
  );

  test("Should not create a Password if it contains invalid characters", async () => {
    const invalidPassword = "Password123€";
    expect(Password.create(invalidPassword)).rejects.toThrow(
      new DomainError(VALIDATION_MESSAGES.PASSWORD_INVALID_CHARS)
    );
  });
});
