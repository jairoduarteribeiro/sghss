import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../src/application/ports/repositories/availability.repository";
import type { RegisterAvailabilityUseCase } from "../../../src/application/use-cases/register-availability.use-case";
import { Availability } from "../../../src/domain/entities/availability";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

describe("Register Availability - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterAvailabilityUseCase;

  const existingDoctorId = Uuid.generate();
  const existingAvailabilities: Availability[] = [
    Availability.from(new Date("2024-07-01T10:00:00Z"), new Date("2024-07-01T12:00:00Z"), existingDoctorId),
    Availability.from(new Date("2024-07-01T14:00:00Z"), new Date("2024-07-01T16:00:00Z"), existingDoctorId),
  ];

  const mockReadAvailabilityRepository: IReadAvailabilityRepository = {
    findByDoctorId: mock(async (doctorId: Uuid) =>
      doctorId.value === existingDoctorId.value ? existingAvailabilities : [],
    ),
  };

  const mockWriteAvailabilityRepository: IWriteAvailabilityRepository = {
    save: mock(async (_availability: Availability) => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IWriteAvailabilityRepository);
    testContainer
      .bind<IReadAvailabilityRepository>(SYMBOLS.IReadAvailabilityRepository)
      .toConstantValue(mockReadAvailabilityRepository);
    testContainer
      .bind<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository)
      .toConstantValue(mockWriteAvailabilityRepository);
    useCase = testContainer.get<RegisterAvailabilityUseCase>(SYMBOLS.RegisterAvailabilityUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register an Availability successfully", async () => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: new Date("2024-07-01T08:00:00Z"),
      endDateTime: new Date("2024-07-01T10:00:00Z"),
    };
    const output = await useCase.execute(input);
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.doctorId).toBe(existingDoctorId.value);
    expect(output.startDateTime).toBe(input.startDateTime);
    expect(output.endDateTime).toBe(input.endDateTime);
  });

  test.each([
    { startDateTime: new Date("2024-07-01T09:00:00Z"), endDateTime: new Date("2024-07-01T11:00:00Z") },
    { startDateTime: new Date("2024-07-01T11:00:00Z"), endDateTime: new Date("2024-07-01T13:00:00Z") },
    { startDateTime: new Date("2024-07-01T11:00:00Z"), endDateTime: new Date("2024-07-01T15:00:00Z") },
    { startDateTime: new Date("2024-07-01T13:00:00Z"), endDateTime: new Date("2024-07-01T15:00:00Z") },
    { startDateTime: new Date("2024-07-01T15:00:00Z"), endDateTime: new Date("2024-07-01T17:00:00Z") },
  ])("Should not register an Availability if it overlaps with existing ones - %s", async (overlapping) => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: overlapping.startDateTime,
      endDateTime: overlapping.endDateTime,
    };
    await expect(useCase.execute(input)).rejects.toThrowError(
      "The availability overlaps with an existing availability",
    );
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(0);
  });
});
