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
  const tomorrowStart = DateBuilder.now().plusDays(1).withTime(8, 0).build();
  const tomorrowEnd = DateBuilder.now().plusDays(1).withTime(12, 0).build();
  const yesterdayStart = DateBuilder.now().plusDays(-1).withTime(8, 0).build();
  const yesterdayEnd = DateBuilder.now().plusDays(-1).withTime(12, 0).build();
  const futureAvailability = Availability.from({ startDateTime: tomorrowStart, endDateTime: tomorrowEnd, doctorId });
  const availableSlot = Slot.from(
    DateBuilder.from(tomorrowStart).withTime(9, 0).build(),
    DateBuilder.from(tomorrowStart).withTime(9, 30).build(),
    Uuid.fromString(futureAvailability.id),
    "AVAILABLE",
  );
  const bookedSlot = Slot.from(
    DateBuilder.from(tomorrowStart).withTime(10, 0).build(),
    DateBuilder.from(tomorrowStart).withTime(10, 30).build(),
    Uuid.fromString(futureAvailability.id),
    "BOOKED",
  );
  futureAvailability.addSlot(availableSlot);
  futureAvailability.addSlot(bookedSlot);
  const pastAvailability = Availability.from({ startDateTime: yesterdayStart, endDateTime: yesterdayEnd, doctorId });
  const pastSlot = Slot.from(
    DateBuilder.from(yesterdayStart).withTime(9, 0).build(),
    DateBuilder.from(yesterdayStart).withTime(9, 30).build(),
    Uuid.fromString(pastAvailability.id),
    "AVAILABLE",
  );
  pastAvailability.addSlot(pastSlot);

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
