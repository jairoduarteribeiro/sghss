import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IReadAvailabilityRepository } from "../../../src/application/ports/repositories/availability.repository";
import type { ListAvailableSlotsUseCase } from "../../../src/application/use-cases/list-available-slots.use-case";
import { Availability } from "../../../src/domain/entities/availability";
import { Slot } from "../../../src/domain/entities/slot";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";

describe("List Available Slots - Use Case", () => {
  let testContainer: Container;
  let useCase: ListAvailableSlotsUseCase;

  const doctorId = Uuid.generate();
  const tomorrowStart = DateBuilder.tomorrow().withTime(8, 0).build();
  const tomorrowEnd = DateBuilder.tomorrow().withTime(9, 0).build();
  const yesterdayStart = DateBuilder.yesterday().withTime(8, 0).build();
  const yesterdayEnd = DateBuilder.yesterday().withTime(8, 30).build();
  const futureAvailability = Availability.from({ startDateTime: tomorrowStart, endDateTime: tomorrowEnd, doctorId });
  // biome-ignore-start lint/style/noNonNullAssertion: test setup
  const availableSlot = futureAvailability.slots[0]!;
  const bookedSlot = futureAvailability.slots[1]!;
  // biome-ignore-end lint/style/noNonNullAssertion: test setup
  bookedSlot.book();
  const pastAvailabilityId = Uuid.generate();
  const pastSlot = Slot.from({
    startDateTime: DateBuilder.from(yesterdayStart).withTime(8, 0).build(),
    endDateTime: DateBuilder.from(yesterdayStart).withTime(8, 30).build(),
    availabilityId: pastAvailabilityId,
  });
  const pastAvailability = Availability.restore({
    id: pastAvailabilityId,
    startDateTime: yesterdayStart,
    endDateTime: yesterdayEnd,
    doctorId,
    slots: [pastSlot],
  });

  const mockReadAvailabilityRepository: IReadAvailabilityRepository = {
    findByDoctorId: mock(async (id: Uuid) =>
      id.value === doctorId.value ? [futureAvailability, pastAvailability] : [],
    ),
    findBySlotId: mock(async () => null),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IReadAvailabilityRepository).toConstantValue(mockReadAvailabilityRepository);
    useCase = testContainer.get<ListAvailableSlotsUseCase>(SYMBOLS.ListAvailableSlotsUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should return only future and available slots", async () => {
    const input = {
      doctorId: doctorId.value,
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.availableSlots).toHaveLength(1);
    const returnedSlot = output.availableSlots[0];
    expect(returnedSlot?.slotId).toBe(availableSlot.id);
    expect(returnedSlot?.status).toBe("AVAILABLE");
    expect(returnedSlot?.startDateTime).toEqual(availableSlot.startDateTime);
  });

  test("Should return empty list if doctor has no availability", async () => {
    const input = {
      doctorId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(output.availableSlots).toHaveLength(0);
  });
});
