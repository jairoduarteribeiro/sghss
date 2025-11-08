import type { IWritePatientRepository } from "@/application/repositories/patient.repository";
import type { IWriteUserRepository } from "@/application/repositories/user.repository";
import type { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import { container } from "@/config/inversify.container";
import { User } from "@/domain/entities/user";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { SYMBOLS } from "@/inversify.symbols";
import { describe, test, expect, afterEach, beforeAll } from "bun:test";

describe("Register Patient Use Case", () => {
  let useCase: RegisterPatientUseCase;
  let writeUserRepository: IWriteUserRepository;
  let writePatientRepository: IWritePatientRepository;

  beforeAll(() => {
    useCase = container.get<RegisterPatientUseCase>(
      SYMBOLS.RegisterPatientUseCase
    );
    writeUserRepository = container.get<IWriteUserRepository>(
      SYMBOLS.IWriteUserRepository
    );
    writePatientRepository = container.get<IWritePatientRepository>(
      SYMBOLS.IWritePatientRepository
    );
  });

  afterEach(() => {
    writePatientRepository.clear();
    writeUserRepository.clear();
  });

  test("Should register a patient successfully", async () => {
    const user = User.from(
      Email.from("john.doe@example.com"),
      await Password.from("Password123!")
    );
    await writeUserRepository.save(user);
    const output = await useCase.execute({
      name: "John Doe",
      cpf: "70000000400",
      userId: user.id,
    });
    expect(output).toBeDefined();
    expect(output.patientId).toBeDefined();
    expect(output.name).toBe("John Doe");
    expect(output.cpf).toBe("70000000400");
    expect(output.userId).toBe(user.id);
  });
});
