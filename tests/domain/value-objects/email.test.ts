import { Email } from "@/domain/value-objects/email";
import { describe, test, expect } from "bun:test";

describe("Email value object", () => {
  test.each([
    "test@example.com",
    "test1@example2.com3",
    "test@example.com.br",
    "test1@example2.com3.br4",
    "my.test@example.com",
    "my1.test2@example3.com4",
  ])(
    "Should create an Email if a valid value (%s) is provided",
    (validEmail) => {
      const email = new Email(validEmail);
      expect(email.value).toBe(validEmail);
    }
  );
});
