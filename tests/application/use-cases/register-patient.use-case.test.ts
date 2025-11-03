import { testContainer } from "tests/config/inversify.container";
import { SYMBOLS } from "@/inversify.symbols";
import { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import { Email } from "@/domain/value-objects/email";
import { describe, test, expect, beforeEach } from "bun:test";
import { InMemoryPatientRepository } from "@tests/fakes/in-memory-patient.repository";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("RegisterPatient Use Case", () => {
  let patientRepository: InMemoryPatientRepository;
  let useCase: RegisterPatientUseCase;

  beforeEach(() => {
    useCase = testContainer.get<RegisterPatientUseCase>(
      SYMBOLS.RegisterPatientUseCase
    );
    patientRepository = testContainer.get<InMemoryPatientRepository>(
      InMemoryPatientRepository
    );
    patientRepository.clear();
  });

  test("Should register a new patient successfully", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.id).toMatch(UUID7_REGEX);
    expect(output.name).toBe(input.name);
    expect(output.email).toBe(input.email);
    expect(output.cpf).toBe(input.cpf);
    const savedPatient = await patientRepository.findByEmail(
      Email.from(input.email)
    );
    expect(savedPatient).toBeDefined();
    expect(savedPatient?.id).toBe(output.id);
    expect(savedPatient?.name).toBe(output.name);
    expect(savedPatient?.cpf).toBe(output.cpf);
    expect(savedPatient?.email).toBe(output.email);
  });

  test("Should not register a patient with an existing email", async () => {
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
      password: "Password123!",
    };
    await expect(useCase.execute(input2)).rejects.toThrowError(
      "Email already in use"
    );
  });

  test("Should not register a patient with an existing CPF", async () => {
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
    await expect(useCase.execute(input2)).rejects.toThrowError(
      "CPF already in use"
    );
  });
});
