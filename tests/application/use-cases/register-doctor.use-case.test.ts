import { describe, test, expect, afterEach, mock, beforeAll } from "bun:test";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { RegisterDoctorUseCase } from "../../../src/application/use-cases/register-doctor";
import { Container } from "inversify";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IWriteDoctorRepository } from "../../../src/application/ports/repositories/doctor.repository";
import type { Doctor } from "../../../src/domain/entities/doctor";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Doctor - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterDoctorUseCase;

  const mockWriteDoctorRepository: IWriteDoctorRepository = {
    save: mock(async (doctor: Doctor) => {}),
    clear: mock(async () => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IWriteDoctorRepository);
    testContainer
      .bind<IWriteDoctorRepository>(SYMBOLS.IWriteDoctorRepository)
      .toConstantValue(mockWriteDoctorRepository);
    useCase = testContainer.get<RegisterDoctorUseCase>(
      SYMBOLS.RegisterDoctorUseCase
    );
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Doctor successfully", async () => {
    const userId = Uuid.generate();
    const input = {
      name: "John Doe",
      crm: "123456-SP",
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
});
