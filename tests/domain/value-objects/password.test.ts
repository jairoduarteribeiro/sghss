import { describe, expect, test } from "bun:test";
import { Password } from "../../../src/domain/value-objects/password";

describe("Password value object", () => {
  test.each(["Pass123!", "LongPass!1234567890"])(
    "Should create and successfully verify a valid password (%s)",
    async (validPassword) => {
      const password = await Password.from(validPassword);
      expect(password.hash).toBeString();
      expect(password.hash).not.toBe("");
      expect(password.hash).not.toBe(validPassword);
      const passwordFromDatabase = Password.fromHash(password.hash);
      expect(await passwordFromDatabase.verify(validPassword)).toBeTrue();
      expect(await passwordFromDatabase.verify("WrongPassword1!")).toBeFalse();
    },
  );

  test.each(["Short1!", "ThisIsWayTooLongPass1!"])(
    "Should not create a Password if length is invalid (%s)",
    async (invalidPassword) => {
      expect(Password.from(invalidPassword)).rejects.toThrowError(
        "Password length must be between 8 and 20 characters",
      );
    },
  );

  test.each(["password123!", "PASSWORD123!", "PasswordAbc!", "Password123"])(
    "Should not create a Password if complexity is not met (%s)",
    async (invalidPassword) => {
      expect(Password.from(invalidPassword)).rejects.toThrowError(
        "Password must have at least 1 uppercase, 1 lowercase, 1 number and 1 special character",
      );
    },
  );

  test("Should not create a Password if it contains invalid characters", async () => {
    const invalidPassword = "Password123€";
    expect(Password.from(invalidPassword)).rejects.toThrowError("Password contains invalid characters");
  });
});
