import type { LoginUseCase } from "@/application/use-cases/login.use-case";
import { User } from "@/domain/entities/user";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import type { InMemoryUserRepository } from "@/infrastructure/persistence/in-memory/in-memory-user.repository";
import { SYMBOLS } from "@/inversify.symbols";
import { testContainer } from "@tests/config/inversify.container";
import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
} from "bun:test";

const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

describe("Login Use Case", async () => {
  let useCase: LoginUseCase;
  let userRepository: InMemoryUserRepository;
  const userEmail = "john.doe@example.com";
  const userPassword = "Password123!";
  const user = User.from(
    Email.from(userEmail),
    await Password.from(userPassword)
  );

  beforeAll(() => {
    userRepository = testContainer.get<InMemoryUserRepository>(
      SYMBOLS.IReadUserRepository
    );
    useCase = testContainer.get<LoginUseCase>(SYMBOLS.LoginUseCase);
  });

  beforeEach(async () => {
    await userRepository.save(user);
  });

  afterEach(() => {
    userRepository.clear();
  });

  test("Should login successfully with correct credentials", async () => {
    const input = {
      email: userEmail,
      password: userPassword,
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.userId).toBe(user.id);
    expect(output.token).toMatch(JWT_REGEX);
  });

  test("Should throw an error when logging in with non-existing email", async () => {
    const input = {
      email: "non.existing@example.com",
      password: "Password123!",
    };
    await expect(useCase.execute(input)).rejects.toThrowError("User not found");
  });
});
