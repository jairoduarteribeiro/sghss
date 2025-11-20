import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../../src/application/ports/repositories/patient.repository";
import type { RegisterPatientUseCase } from "../../../src/application/use-cases/register-patient.use-case";
import { Patient } from "../../../src/domain/entities/patient";
import { DomainValidationError } from "../../../src/domain/errors/domain-validation.error";
import { Cpf } from "../../../src/domain/value-objects/cpf";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Patient - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterPatientUseCase;

  // Create an existing patient to simulate CPF conflict
  const existingPatient = Patient.from({
    name: Name.from("John Doe"),
    cpf: Cpf.from("70000000400"),
    userId: Uuid.generate(),
  });

  // Mock Repositories
  const mockReadPatientRepository: IReadPatientRepository = {
    findById: mock(async () => null),
    findByCpf: mock(async (cpf: Cpf) => (cpf.value === existingPatient.cpf ? existingPatient : null)),
  };
  const mockWritePatientRepository: IWritePatientRepository = {
    save: mock(async () => {}),
    clear: mock(async () => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer
      .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
      .toConstantValue(mockReadPatientRepository);
    testContainer
      .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
      .toConstantValue(mockWritePatientRepository);
    useCase = testContainer.get<RegisterPatientUseCase>(SYMBOLS.RegisterPatientUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Patient successfully", async () => {
    const input = {
      name: "Jane Doe",
      cpf: "12984180038",
      userId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(mockWritePatientRepository.save).toHaveBeenCalledTimes(1);
    expect(output.patientId).toMatch(UUID7_REGEX);
    expect(output.name).toBe(input.name);
    expect(output.cpf).toBe(input.cpf);
    expect(output.userId).toBe(input.userId);
  });

  test("Should not register a Patient with an existing Cpf", async () => {
    const input = {
      name: "John Smith",
      cpf: "70000000400",
      userId: Uuid.generate().value,
    };
    expect(useCase.execute(input)).rejects.toThrowError("CPF already in use");
    expect(mockWritePatientRepository.save).toHaveBeenCalledTimes(0);
  });

  test("Should not register a Patient with invalid input", async () => {
    const input = {
      name: "Jane Doe",
      cpf: "129.841.800.38",
      userId: Uuid.generate().value,
    };
    expect(useCase.execute(input)).rejects.toThrowError(DomainValidationError);
    expect(mockWritePatientRepository.save).toHaveBeenCalledTimes(0);
  });
});
