import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { RegisterAvailabilityUseCase } from "../../../src/application/use-cases/register-availability.use-case";
import { Availability } from "../../../src/domain/entities/availability";
import { DomainValidationError } from "../../../src/domain/errors/domain-validation.error";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";
import {
  createMockReadAvailabilityRepository,
  createMockWriteAvailabilityRepository,
} from "../../utils/mocks/repositories";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Availability - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterAvailabilityUseCase;

  // Test Data
  const existingDoctorId = Uuid.generate();
  const tomorrow = DateBuilder.tomorrow();
  const existingAvailabilities: Availability[] = [
    Availability.from({
      startDateTime: tomorrow.withTime(10, 0).build(),
      endDateTime: tomorrow.withTime(12, 0).build(),
      doctorId: existingDoctorId,
    }),
    Availability.from({
      startDateTime: tomorrow.withTime(14, 0).build(),
      endDateTime: tomorrow.withTime(16, 0).build(),
      doctorId: existingDoctorId,
    }),
  ];

  // Mock Repositories
  const mockReadAvailabilityRepository = createMockReadAvailabilityRepository({
    findByDoctorId: mock(async (doctorId: Uuid) =>
      doctorId.value === existingDoctorId.value ? existingAvailabilities : [],
    ),
  });
  const mockWriteAvailabilityRepository = createMockWriteAvailabilityRepository();

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadAvailabilityRepository).toConstantValue(mockReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IWriteAvailabilityRepository).toConstantValue(mockWriteAvailabilityRepository);
    useCase = testContainer.get<RegisterAvailabilityUseCase>(SYMBOLS.RegisterAvailabilityUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register an Availability successfully", async () => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: tomorrow.withTime(8, 0).build(),
      endDateTime: tomorrow.withTime(10, 0).build(),
    };
    const output = await useCase.execute(input);
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(1);
    expect(output.availabilityId).toMatch(UUID7_REGEX);
    expect(output.doctorId).toBe(existingDoctorId.value);
    expect(output.startDateTime).toBe(input.startDateTime);
    expect(output.endDateTime).toBe(input.endDateTime);
    expect(output.slots).toHaveLength(4);
    expect(output.slots[0]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: tomorrow.withTime(8, 0).build(),
      endDateTime: tomorrow.withTime(8, 30).build(),
      status: "AVAILABLE",
    });
    expect(output.slots[1]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: tomorrow.withTime(8, 30).build(),
      endDateTime: tomorrow.withTime(9, 0).build(),
      status: "AVAILABLE",
    });
    expect(output.slots[2]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: tomorrow.withTime(9, 0).build(),
      endDateTime: tomorrow.withTime(9, 30).build(),
      status: "AVAILABLE",
    });
    expect(output.slots[3]).toEqual({
      slotId: expect.stringMatching(UUID7_REGEX),
      startDateTime: tomorrow.withTime(9, 30).build(),
      endDateTime: tomorrow.withTime(10, 0).build(),
      status: "AVAILABLE",
    });
  });

  test.each([
    { startDateTime: tomorrow.withTime(9, 0).build(), endDateTime: tomorrow.withTime(11, 0).build() },
    { startDateTime: tomorrow.withTime(11, 0).build(), endDateTime: tomorrow.withTime(13, 0).build() },
    { startDateTime: tomorrow.withTime(11, 0).build(), endDateTime: tomorrow.withTime(15, 0).build() },
    { startDateTime: tomorrow.withTime(13, 0).build(), endDateTime: tomorrow.withTime(15, 0).build() },
    { startDateTime: tomorrow.withTime(15, 0).build(), endDateTime: tomorrow.withTime(17, 0).build() },
  ])("Should not register an Availability if it overlaps with existing ones - %s", async (overlapping) => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: overlapping.startDateTime,
      endDateTime: overlapping.endDateTime,
    };
    expect(useCase.execute(input)).rejects.toThrowError("The new availability overlaps with existing availabilities");
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(0);
  });

  test("Should not register an Availability if endDateTime is before startDateTime", async () => {
    const input = {
      doctorId: existingDoctorId.value,
      startDateTime: tomorrow.withTime(12, 0).build(),
      endDateTime: tomorrow.withTime(10, 0).build(),
    };
    expect(useCase.execute(input)).rejects.toThrowError(DomainValidationError);
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(0);
  });
});
