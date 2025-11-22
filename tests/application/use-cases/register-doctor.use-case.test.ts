import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { RegisterDoctorUseCase } from "../../../src/application/use-cases/register-doctor.use-case";
import { Doctor } from "../../../src/domain/entities/doctor";
import { DomainValidationError } from "../../../src/domain/errors/domain-validation.error";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { createMockReadDoctorRepository, createMockWriteDoctorRepository } from "../../utils/mocks/repositories";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Doctor - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterDoctorUseCase;

  // Test Data
  const existingDoctor = Doctor.from({
    name: Name.from("David Smith"),
    crm: Crm.from("654321-RJ"),
    specialty: MedicalSpecialty.from("Cardiology"),
    userId: Uuid.generate(),
  });

  // Mock Repositories
  const mockReadDoctorRepository = createMockReadDoctorRepository({
    findByCrm: mock(async (crm: Crm) => (crm.value === existingDoctor.crm ? existingDoctor : null)),
  });
  const mockWriteDoctorRepository = createMockWriteDoctorRepository();

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadDoctorRepository).toConstantValue(mockReadDoctorRepository);
    testContainer.bind(SYMBOLS.IWriteDoctorRepository).toConstantValue(mockWriteDoctorRepository);
    useCase = testContainer.get<RegisterDoctorUseCase>(SYMBOLS.RegisterDoctorUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Doctor successfully", async () => {
    const input = {
      name: "John Doe",
      crm: "123456-SP",
      specialty: "Cardiology",
      userId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(mockWriteDoctorRepository.save).toHaveBeenCalledTimes(1);
    expect(output.doctorId).toMatch(UUID7_REGEX);
    expect(output.name).toBe(input.name);
    expect(output.crm).toBe(input.crm);
    expect(output.userId).toBe(input.userId);
  });

  test("Should not register a Doctor with an existing Crm", async () => {
    const input = {
      name: "Jane Doe",
      crm: "654321-RJ",
      specialty: "Cardiology",
      userId: Uuid.generate().value,
    };
    expect(useCase.execute(input)).rejects.toThrowError("Crm already in use");
    expect(mockWriteDoctorRepository.save).toHaveBeenCalledTimes(0);
  });

  test("Should not register a Doctor with invalid input", async () => {
    const input = {
      name: "John Doe",
      crm: "1234567-SP",
      specialty: "Cardiology",
      userId: Uuid.generate().value,
    };
    expect(useCase.execute(input)).rejects.toThrowError(DomainValidationError);
    expect(mockWriteDoctorRepository.save).toHaveBeenCalledTimes(0);
  });
});
