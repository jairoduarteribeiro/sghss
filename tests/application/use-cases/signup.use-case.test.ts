import type { SignupUseCase } from "@/application/use-cases/signup.use-case";
import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { SYMBOLS } from "@/inversify.symbols";
import { container } from "@/config/inversify.container";
import { describe, test, expect, afterEach, beforeAll } from "bun:test";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Signup Use Case", () => {
  let useCase: SignupUseCase;
  let readUserRepository: IReadUserRepository;
  let writeUserRepository: IWriteUserRepository;
  let readPatientRepository: IReadPatientRepository;
  let writePatientRepository: IWritePatientRepository;

  beforeAll(() => {
    useCase = container.get<SignupUseCase>(SYMBOLS.SignupUseCase);
    readUserRepository = container.get<IReadUserRepository>(
      SYMBOLS.IReadUserRepository
    );
    writeUserRepository = container.get<IWriteUserRepository>(
      SYMBOLS.IWriteUserRepository
    );
    readPatientRepository = container.get<IReadPatientRepository>(
      SYMBOLS.IReadPatientRepository
    );
    writePatientRepository = container.get<IWritePatientRepository>(
      SYMBOLS.IWritePatientRepository
    );
  });

  afterEach(() => {
    writeUserRepository.clear();
    writePatientRepository.clear();
  });

  test("Should sign up a Patient successfully", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.userId).toMatch(UUID7_REGEX);
    expect(output.patientId).toMatch(UUID7_REGEX);
    expect(output.name).toBe(input.name);
    expect(output.email).toBe(input.email);
    expect(output.cpf).toBe(input.cpf);
    expect(output.role).toBe("PATIENT");
    const savedUser = await readUserRepository.findByEmail(
      Email.from(input.email)
    );
    expect(savedUser).toBeDefined();
    expect(savedUser?.id).toBe(output.userId);
    expect(savedUser?.email).toBe(output.email);
    expect(savedUser?.role).toBe("PATIENT");
    const savedPatient = await readPatientRepository.findByCpf(
      Cpf.from(input.cpf)
    );
    expect(savedPatient).toBeDefined();
    expect(savedPatient?.id).toBe(output.patientId);
    expect(savedPatient?.name).toBe(output.name);
    expect(savedPatient?.cpf).toBe(output.cpf);
    expect(savedPatient?.userId).toBe(savedUser?.id);
  });

  test("Should not allow signup with existing email", async () => {
    const input1 = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    await useCase.execute(input1);
    const input2 = {
      name: "John Smith Doe",
      cpf: "12984180038",
      email: "john.doe@example.com",
      password: "Password456!",
    };
    expect(useCase.execute(input2)).rejects.toThrow("Email already in use");
  });

  test("Should not allow signup with existing Cpf", async () => {
    const input1 = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    await useCase.execute(input1);
    const input2 = {
      name: "John Smith Doe",
      cpf: "70000000400",
      email: "john.smith.doe@example.com",
      password: "Password123!",
    };
    expect(useCase.execute(input2)).rejects.toThrow("CPF already in use");
  });
});
