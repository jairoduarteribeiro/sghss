// biome-ignore-all lint/style/noNonNullAssertion: test setup
import { afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { CancelAppointmentUseCase } from "../../../src/application/use-cases/cancel-appointment.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Availability } from "../../../src/domain/entities/availability";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";
import {
  createMockReadAppointmentRepository,
  createMockReadAvailabilityRepository,
  createMockWriteAppointmentRepository,
  createMockWriteAvailabilityRepository,
} from "../../utils/mocks/repositories";

describe("Cancel Appointment - Use Case", () => {
  let testContainer: Container;
  let useCase: CancelAppointmentUseCase;

  // Test Data
  const doctorId = Uuid.generate();
  const patientId = Uuid.generate();
  const availability = Availability.from({
    startDateTime: DateBuilder.now().plusDays(1).withTime(10, 0).build(),
    endDateTime: DateBuilder.now().plusDays(1).withTime(12, 0).build(),
    doctorId,
  });
  const slot = availability.slots[0]!;
  let appointment: Appointment;

  // Mock Repositories
  const mockReadAppointmentRepository = createMockReadAppointmentRepository({
    findById: mock(async (id: Uuid) => (id.value === appointment.id ? appointment : null)),
  });
  const mockReadAvailabilityRepository = createMockReadAvailabilityRepository({
    findBySlotId: mock(async (id: Uuid) => (id.value === slot.id ? availability : null)),
  });
  const mockWriteAppointmentRepository = createMockWriteAppointmentRepository();
  const mockWriteAvailabilityRepository = createMockWriteAvailabilityRepository();

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadAppointmentRepository).toConstantValue(mockReadAppointmentRepository);
    testContainer.bind(SYMBOLS.IWriteAppointmentRepository).toConstantValue(mockWriteAppointmentRepository);
    testContainer.bind(SYMBOLS.IReadAvailabilityRepository).toConstantValue(mockReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IWriteAvailabilityRepository).toConstantValue(mockWriteAvailabilityRepository);
    useCase = testContainer.get<CancelAppointmentUseCase>(SYMBOLS.CancelAppointmentUseCase);
  });

  beforeEach(() => {
    appointment = Appointment.from({ slotId: Uuid.fromString(slot.id), patientId, modality: "IN_PERSON" });
    slot.book();
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should cancel an appointment and release the slot successfully", async () => {
    const input = {
      appointmentId: appointment.id,
    };
    await useCase.execute(input);
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(1);
    expect(appointment.status).toBe("CANCELLED");
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(1);
    expect(slot.status).toBe("AVAILABLE");
  });
});
