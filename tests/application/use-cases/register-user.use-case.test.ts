import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { RegisterUserUseCase } from "../../../src/application/use-cases/register-user.use-case";
import { User } from "../../../src/domain/entities/user";
import { DomainValidationError } from "../../../src/domain/errors/domain-validation.error";
import { Email } from "../../../src/domain/value-objects/email";
import { Password } from "../../../src/domain/value-objects/password";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { createMockReadUserRepository, createMockWriteUserRepository } from "../../utils/mocks/repositories";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register User - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterUserUseCase;

  // Test Data
  const existingUser = User.from({
    email: Email.from("john.doe@example.com"),
    password: await Password.from("Password123!"),
  });

  // Mock Repositories
  const mockReadUserRepository = createMockReadUserRepository({
    findByEmail: mock(async (email: Email) => (email.value === existingUser.email ? existingUser : null)),
  });
  const mockWriteUserRepository = createMockWriteUserRepository();

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadUserRepository).toConstantValue(mockReadUserRepository);
    testContainer.bind(SYMBOLS.IWriteUserRepository).toConstantValue(mockWriteUserRepository);
    useCase = testContainer.get(SYMBOLS.RegisterUserUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a user with default role (PATIENT) when no role is provided", async () => {
    const input = {
      email: "jane.doe@example.com",
      password: "Password123!",
    };
    const output = await useCase.execute(input);
    expect(mockWriteUserRepository.save).toHaveBeenCalledTimes(1);
    expect(output.userId).toMatch(UUID7_REGEX);
    expect(output.email).toBe(input.email);
    expect(output.role).toBe("PATIENT");
  });

  test("Should register a user with specified role", async () => {
    const input = {
      email: "jane.doe@example.com",
      password: "Password123!",
      role: "DOCTOR",
    };
    const output = await useCase.execute(input);
    expect(mockWriteUserRepository.save).toHaveBeenCalledTimes(1);
    expect(output.userId).toMatch(UUID7_REGEX);
    expect(output.email).toBe(input.email);
    expect(output.role).toBe(input.role);
  });

  test("Should not allow signup with existing email", async () => {
    const input = {
      email: "john.doe@example.com",
      password: "Password456!",
    };
    expect(useCase.execute(input)).rejects.toThrowError("Email already in use");
    expect(mockWriteUserRepository.save).toHaveBeenCalledTimes(0);
  });

  test("Should throw a DomainValidationError for invalid input", async () => {
    const input = {
      email: "invalid-email",
      password: "Password123!",
    };
    expect(useCase.execute(input)).rejects.toThrowError(DomainValidationError);
    expect(mockWriteUserRepository.save).toHaveBeenCalledTimes(0);
  });
});
