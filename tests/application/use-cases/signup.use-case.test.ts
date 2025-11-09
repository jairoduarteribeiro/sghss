import { describe, test, expect, beforeAll, mock, afterEach } from "bun:test";
import { Container } from "inversify";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../src/application/repositories/user.repository";
import type { SignupUseCase } from "../../../src/application/use-cases/signup.use-case";
import { container } from "../../../src/config/inversify.container";
import { User } from "../../../src/domain/entities/user";
import { Email } from "../../../src/domain/value-objects/email";
import { Password } from "../../../src/domain/value-objects/password";
import { SYMBOLS } from "../../../src/inversify.symbols";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Signup Use Case", async () => {
  let testContainer: Container;
  let useCase: SignupUseCase;

  const existingUser = User.from(
    Email.from("john.doe@example.com"),
    await Password.from("Password123!"),
    "PATIENT"
  );
  const mockReadUserRepository: IReadUserRepository = {
    findByEmail: mock(async (email: Email) =>
      email.value === existingUser.email ? existingUser : null
    ),
  };
  const mockWriteUserRepository: IWriteUserRepository = {
    save: mock(async (user: User) => {}),
    clear: mock(async () => {}),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadUserRepository);
    testContainer.unbind(SYMBOLS.IWriteUserRepository);
    testContainer
      .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
      .toConstantValue(mockReadUserRepository);
    testContainer
      .bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository)
      .toConstantValue(mockWriteUserRepository);
    useCase = testContainer.get<SignupUseCase>(SYMBOLS.SignupUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should sign up a Patient successfully", async () => {
    const input = {
      email: "jane.doe@example.com",
      password: "Password123!",
      role: "PATIENT",
    };
    const output = await useCase.execute(input);
    expect(mockWriteUserRepository.save).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.userId).toMatch(UUID7_REGEX);
    expect(output.email).toBe(input.email);
    expect(output.role).toBe(input.role);
  });

  test("Should not allow signup with existing email", async () => {
    const input = {
      email: "john.doe@example.com",
      password: "Password456!",
      role: "PATIENT",
    };
    expect(useCase.execute(input)).rejects.toThrow("Email already in use");
    expect(mockWriteUserRepository.save).toHaveBeenCalledTimes(0);
  });
});
