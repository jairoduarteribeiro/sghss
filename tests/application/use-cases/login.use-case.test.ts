import type { LoginUseCase } from "@/application/use-cases/login.use-case";
import { User } from "@/domain/entities/user";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { SYMBOLS } from "@/inversify.symbols";
import { container } from "@/config/inversify.container";
import { describe, test, expect, beforeAll, mock, afterAll } from "bun:test";
import type { IReadUserRepository } from "@/application/repositories/user.repository";
import { Container } from "inversify";

const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

describe("Login Use Case", async () => {
  let testContainer: Container;
  let useCase: LoginUseCase;

  const existingUser = User.from(
    Email.from("john.doe@example.com"),
    await Password.from("Password123!")
  );
  const mockReadUserRepository: IReadUserRepository = {
    findByEmail: mock(async (email: Email) => {
      return email.value === existingUser.email ? existingUser : null;
    }),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    await testContainer.unbind(SYMBOLS.IReadUserRepository);
    testContainer
      .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
      .toConstantValue(mockReadUserRepository);
    useCase = testContainer.get<LoginUseCase>(SYMBOLS.LoginUseCase);
  });

  test("Should login successfully with correct credentials", async () => {
    const input = {
      email: existingUser.email,
      password: "Password123!",
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.userId).toBe(existingUser.id);
    expect(output.token).toMatch(JWT_REGEX);
  });

  test("Should throw an error when logging in with non-existing email", async () => {
    const input = {
      email: "non.existing@example.com",
      password: "Password123!",
    };
    expect(useCase.execute(input)).rejects.toThrowError("User not found");
  });

  test("Should throw an error when logging in with incorrect password", async () => {
    const input = {
      email: existingUser.email,
      password: "IncorrectPassword!",
    };
    expect(useCase.execute(input)).rejects.toThrowError("Invalid password");
  });
});
