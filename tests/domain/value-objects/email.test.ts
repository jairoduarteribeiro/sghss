import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";
import { Email } from "@/domain/value-objects/email";
import { describe, test, expect } from "bun:test";

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
      const email = new Email(validEmail);
      expect(email.value).toBe(validEmail);
    }
  );

  test("Should create a normalized (lowercase and trimmed) Email", () => {
    const unnormalizedEmail = "  Test@Example.COM  ";
    const expectedNormalizedEmail = "test@example.com";
    const email = new Email(unnormalizedEmail);
    expect(email.value).toBe(expectedNormalizedEmail);
  });

  test("Should create an Email with max valid length (254 chars)", () => {
    const longEmail = generateEmailWithLength(254);
    const email = new Email(longEmail);
    expect(email.value).toBe(longEmail);
  });

  test("Should not create an Email with invalid length (255 chars)", () => {
    const longEmail = generateEmailWithLength(255);
    const act = () => new Email(longEmail);
    expect(act).toThrow(new DomainError(VALIDATION_MESSAGES.EMAIL_TOO_LONG));
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
      const act = () => new Email(invalidFormat);
      expect(act).toThrow(
        new DomainError(VALIDATION_MESSAGES.EMAIL_INVALID_FORMAT)
      );
    }
  );
});
