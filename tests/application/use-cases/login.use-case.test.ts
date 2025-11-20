import { beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IReadUserRepository } from "../../../src/application/ports/repositories/user.repository";
import type { IAuthTokenService } from "../../../src/application/ports/services/auth-token-service";
import type { LoginUseCase } from "../../../src/application/use-cases/login.use-case";
import { User } from "../../../src/domain/entities/user";
import { DomainValidationError } from "../../../src/domain/errors/domain-validation.error";
import { Email } from "../../../src/domain/value-objects/email";
import { Password } from "../../../src/domain/value-objects/password";
import { container } from "../../../src/infrastructure/di/inversify.container";

describe("Login - Use Case", async () => {
  let testContainer: Container;
  let useCase: LoginUseCase;

  // Create an existing user for login tests
  const existingUser = User.from({
    email: Email.from("john.doe@example.com"),
    password: await Password.from("Password123!"),
  });

  // Mocked ReadUserRepository
  const mockReadUserRepository: IReadUserRepository = {
    findByEmail: mock(async (email: Email) => (email.value === existingUser.email ? existingUser : null)),
  };

  // Mocked AuthTokenService
  const MOCK_TOKEN = "mock.jwt.token";
  const mockTokenService: IAuthTokenService = {
    generate: mock(() => MOCK_TOKEN),
    extract: mock(() => null),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind<IReadUserRepository>(SYMBOLS.IReadUserRepository).toConstantValue(mockReadUserRepository);
    testContainer.bind<IAuthTokenService>(SYMBOLS.IAuthTokenService).toConstantValue(mockTokenService);
    useCase = testContainer.get<LoginUseCase>(SYMBOLS.LoginUseCase);
  });

  test("Should login successfully with correct credentials", async () => {
    const input = {
      email: existingUser.email,
      password: "Password123!",
    };
    const output = await useCase.execute(input);
    expect(output.userId).toBe(existingUser.id);
    expect(output.token).toBe(MOCK_TOKEN);
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

  test("Should throw a DomainValidationError for invalid input", async () => {
    const input = {
      email: "invalid-email-format",
      password: "Password123!",
    };
    expect(useCase.execute(input)).rejects.toThrowError(DomainValidationError);
  });
});
