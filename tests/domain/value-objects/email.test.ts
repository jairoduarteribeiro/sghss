import { describe, test, expect } from "bun:test";
import { Email } from "../../../src/domain/value-objects/email";

const generateEmailWithLength = (totalLength: number): string => {
  const domain = "@example.com";
  const localPartLength = totalLength - domain.length;
  const localPart = "a".repeat(localPartLength);
  return `${localPart}${domain}`;
};

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
      const email = Email.from(validEmail);
      expect(email.value).toBe(validEmail);
    }
  );

  test("Should create a normalized (lowercase and trimmed) Email", () => {
    const unnormalizedEmail = "  Test@Example.COM  ";
    const expectedNormalizedEmail = "test@example.com";
    const email = Email.from(unnormalizedEmail);
    expect(email.value).toBe(expectedNormalizedEmail);
  });

  test("Should create an Email with max valid length (254 chars)", () => {
    const longEmail = generateEmailWithLength(254);
    const email = Email.from(longEmail);
    expect(email.value).toBe(longEmail);
  });

  test("Should not create an Email with invalid length (255 chars)", () => {
    const longEmail = generateEmailWithLength(255);
    const act = () => Email.from(longEmail);
    expect(act).toThrowError("Email must be at most 254 characters long");
  });

  test.each([
    "testexample.com",
    "test@.com",
    "test@example",
    "test@example.",
    "test@example..com",
    "test@e.com",
    "test@example.c",
    "test@1example.com",
    "test@1example.1com",
    "@example.com",
    "test.@example.com",
    ".test@example.com",
    "my..test@example.com",
    "t@example.com",
    "my.t@example.com",
    "1test@example.com",
    "my.1test@example.com",
  ])(
    "Should not create an Email if format is invalid (%s)",
    (invalidFormat) => {
      const act = () => Email.from(invalidFormat);
      expect(act).toThrowError("Email with invalid format");
    }
  );
});
