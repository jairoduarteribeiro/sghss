import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../src/application/ports/repositories/availability.repository";
import type { IUnitOfWork } from "../../../src/application/ports/unit-of-work";
import type { RegisterAvailabilityUseCase } from "../../../src/application/use-cases/register-availability.use-case";
import { Availability } from "../../../src/domain/entities/availability";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Availability - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterAvailabilityUseCase;

  const existingDoctorId = Uuid.generate();
  const existingAvailabilities: Availability[] = [
    Availability.from(new Date("2024-07-01T10:00:00.000Z"), new Date("2024-07-01T12:00:00.000Z"), existingDoctorId),
    Availability.from(new Date("2024-07-01T14:00:00.000Z"), new Date("2024-07-01T16:00:00.000Z"), existingDoctorId),
  ];

  const mockUnitOfWork: IUnitOfWork = {
    transaction: async <T>(fn: (container: Container) => Promise<T>) => {
      return fn(testContainer);
    },
  };

  const mockReadAvailabilityRepository: IReadAvailabilityRepository = {
    findByDoctorId: mock(async (doctorId: Uuid) =>
      doctorId.value === existingDoctorId.value ? existingAvailabilities : [],
    ),
    findBySlotId: mock(async (_slotId: Uuid) => null),
  };

  const mockWriteAvailabilityRepository: IWriteAvailabilityRepository = {
    save: mock(async (_availability: Availability) => {}),
    update: mock(async (_availability: Availability) => {}),
    clear: mock(async () => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IWriteAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IUnitOfWork);
    testContainer
      .bind<IReadAvailabilityRepository>(SYMBOLS.IReadAvailabilityRepository)
      .toConstantValue(mockReadAvailabilityRepository);
    testContainer
      .bind<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository)
      .toConstantValue(mockWriteAvailabilityRepository);
    testContainer.bind<IUnitOfWork>(SYMBOLS.IUnitOfWork).toConstantValue(mockUnitOfWork);
    useCase = testContainer.get<RegisterAvailabilityUseCase>(SYMBOLS.RegisterAvailabilityUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register an Availability successfully", async () => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: new Date("2024-07-01T08:00:00.000Z"),
      endDateTime: new Date("2024-07-01T10:00:00.000Z"),
    };
    const output = await useCase.execute(input);
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.availabilityId).toMatch(UUID7_REGEX);
    expect(output.doctorId).toBe(existingDoctorId.value);
    expect(output.startDateTime).toBe(input.startDateTime);
    expect(output.endDateTime).toBe(input.endDateTime);
    expect(output.slots.length).toBe(4);
    expect(output.slots[0]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: new Date("2024-07-01T08:00:00.000Z"),
      endDateTime: new Date("2024-07-01T08:30:00.000Z"),
      status: "AVAILABLE",
    });
    expect(output.slots[1]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: new Date("2024-07-01T08:30:00.000Z"),
      endDateTime: new Date("2024-07-01T09:00:00.000Z"),
      status: "AVAILABLE",
    });
    expect(output.slots[2]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: new Date("2024-07-01T09:00:00.000Z"),
      endDateTime: new Date("2024-07-01T09:30:00.000Z"),
      status: "AVAILABLE",
    });
    expect(output.slots[3]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: new Date("2024-07-01T09:30:00.000Z"),
      endDateTime: new Date("2024-07-01T10:00:00.000Z"),
      status: "AVAILABLE",
    });
  });

  test.each([
    { startDateTime: new Date("2024-07-01T09:00:00.000Z"), endDateTime: new Date("2024-07-01T11:00:00.000Z") },
    { startDateTime: new Date("2024-07-01T11:00:00.000Z"), endDateTime: new Date("2024-07-01T13:00:00.000Z") },
    { startDateTime: new Date("2024-07-01T11:00:00.000Z"), endDateTime: new Date("2024-07-01T15:00:00.000Z") },
    { startDateTime: new Date("2024-07-01T13:00:00.000Z"), endDateTime: new Date("2024-07-01T15:00:00.000Z") },
    { startDateTime: new Date("2024-07-01T15:00:00.000Z"), endDateTime: new Date("2024-07-01T17:00:00.000Z") },
  ])("Should not register an Availability if it overlaps with existing ones - %s", async (overlapping) => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: overlapping.startDateTime,
      endDateTime: overlapping.endDateTime,
    };
    expect(useCase.execute(input)).rejects.toThrowError("The new availability overlaps with existing availabilities");
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(0);
  });
});
