import { describe, test, expect, afterEach, mock, beforeAll } from "bun:test";
import { Container } from "inversify";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../../src/application/ports/repositories/patient.repository";
import type { RegisterPatientUseCase } from "../../../src/application/use-cases/register-patient.use-case";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { Patient } from "../../../src/domain/entities/patient";
import { Cpf } from "../../../src/domain/value-objects/cpf";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { Name } from "../../../src/domain/value-objects/name";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";

describe("Register Patient Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterPatientUseCase;

  const existingPatient = Patient.from(
    Name.from("John Doe"),
    Cpf.from("70000000400"),
    Uuid.generate()
  );
  const mockReadPatientRepository: IReadPatientRepository = {
    findByCpf: mock(async (cpf: Cpf) =>
      cpf.value === existingPatient.cpf ? existingPatient : null
    ),
  };
  const mockWritePatientRepository: IWritePatientRepository = {
    save: mock(async (patient: Patient) => {}),
    clear: mock(async () => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadPatientRepository);
    testContainer.unbind(SYMBOLS.IWritePatientRepository);
    testContainer
      .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
      .toConstantValue(mockReadPatientRepository);
    testContainer
      .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
      .toConstantValue(mockWritePatientRepository);
    useCase = testContainer.get<RegisterPatientUseCase>(
      SYMBOLS.RegisterPatientUseCase
    );
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Patient successfully", async () => {
    const userId = Uuid.generate();
    const input = {
      name: "Jane Doe",
      cpf: "12984180038",
      userId: userId.value,
    };
    const output = await useCase.execute(input);
    expect(mockWritePatientRepository.save).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.patientId).toBeDefined();
    expect(output.name).toBe("Jane Doe");
    expect(output.cpf).toBe("12984180038");
    expect(output.userId).toBe(userId.value);
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
    expect(useCase.execute(input)).rejects.toThrowError(
      "CPF with invalid format"
    );
    expect(mockWritePatientRepository.save).toHaveBeenCalledTimes(0);
  });
});
