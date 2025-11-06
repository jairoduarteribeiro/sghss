import { User } from "@/domain/entities/user";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { describe, test, expect } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("User entity", () => {
  test("Should create a User successfully", async () => {
    const user = User.from(
      Email.from("john.doe@example.com"),
      await Password.from("Password123!")
    );
    expect(user.id).toMatch(UUID7_REGEX);
    expect(user.email).toBe("john.doe@example.com");
    expect(user.passwordHash).not.toBe("Password123!");
    expect(user.verifyPassword("Password123!")).resolves.toBe(true);
    expect(user.verifyPassword("WrongPassword")).resolves.toBe(false);
    expect(user.role).toBe("PATIENT");
  });
});
