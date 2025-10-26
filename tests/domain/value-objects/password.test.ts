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
});
