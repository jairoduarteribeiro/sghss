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
});
