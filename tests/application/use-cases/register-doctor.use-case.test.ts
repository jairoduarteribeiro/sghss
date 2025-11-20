import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../../src/application/ports/repositories/doctor.repository";
import type { RegisterDoctorUseCase } from "../../../src/application/use-cases/register-doctor.use-case";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Doctor - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterDoctorUseCase;

  const existingDoctor = Doctor.from({
    name: Name.from("David Smith"),
    crm: Crm.from("654321-RJ"),
    specialty: MedicalSpecialty.from("Cardiology"),
    userId: Uuid.generate(),
  });
  const mockReadDoctorRepository: IReadDoctorRepository = {
    findById: mock(async (_id: Uuid) => null),
    findByCrm: mock(async (crm: Crm) => (crm.value === existingDoctor.crm ? existingDoctor : null)),
    findAll: mock(async () => []),
  };
  const mockWriteDoctorRepository: IWriteDoctorRepository = {
    save: mock(async (_doctor: Doctor) => {}),
    clear: mock(async () => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadDoctorRepository);
    testContainer.unbind(SYMBOLS.IWriteDoctorRepository);
    testContainer.bind<IReadDoctorRepository>(SYMBOLS.IReadDoctorRepository).toConstantValue(mockReadDoctorRepository);
    testContainer
      .bind<IWriteDoctorRepository>(SYMBOLS.IWriteDoctorRepository)
      .toConstantValue(mockWriteDoctorRepository);
    useCase = testContainer.get<RegisterDoctorUseCase>(SYMBOLS.RegisterDoctorUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Doctor successfully", async () => {
    const userId = Uuid.generate();
    const input = {
      name: "John Doe",
      crm: "123456-SP",
      specialty: "Cardiology",
      userId: userId.value,
    };
    const output = await useCase.execute(input);
    expect(mockWriteDoctorRepository.save).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
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
    expect(useCase.execute(input)).rejects.toThrowError("CRM with invalid format");
    expect(mockWriteDoctorRepository.save).toHaveBeenCalledTimes(0);
  });
});
