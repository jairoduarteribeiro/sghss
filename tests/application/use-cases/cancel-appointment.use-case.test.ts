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
  const firstAvailableSlot = availability.slots[0]!;
  const secondAvailableSlot = availability.slots[1]!;
  let appointments: Appointment[];

  // Mock Repositories
  const mockReadAppointmentRepository = createMockReadAppointmentRepository({
    findById: mock(async (id: Uuid) => appointments.find((appt) => appt.id === id.value) || null),
  });
  const mockReadAvailabilityRepository = createMockReadAvailabilityRepository({
    findBySlotId: mock(async (id: Uuid) =>
      availability.slots.some((slot) => slot.id === id.value) ? availability : null,
    ),
  });
  const mockWriteAppointmentRepository = createMockWriteAppointmentRepository();
  const mockWriteAvailabilityRepository = createMockWriteAvailabilityRepository();

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadAppointmentRepository).toConstantValue(mockReadAppointmentRepository);
    testContainer.bind(SYMBOLS.IWriteAppointmentRepository).toConstantValue(mockWriteAppointmentRepository);
    testContainer.bind(SYMBOLS.IReadAvailabilityRepository).toConstantValue(mockReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IWriteAvailabilityRepository).toConstantValue(mockWriteAvailabilityRepository);
    useCase = testContainer.get(SYMBOLS.CancelAppointmentUseCase);
  });

  beforeEach(() => {
    firstAvailableSlot.book();
    secondAvailableSlot.book();
    appointments = [
      Appointment.from({ slotId: Uuid.fromString(firstAvailableSlot.id), patientId, modality: "IN_PERSON" }),
      Appointment.from({ slotId: Uuid.fromString(secondAvailableSlot.id), patientId, modality: "IN_PERSON" }),
      Appointment.from({ slotId: Uuid.generate(), patientId, modality: "IN_PERSON" }),
    ];
    appointments[1]?.complete();
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should cancel an appointment and release the slot successfully", async () => {
    const scheduledAppointment = appointments[0]!;
    const input = {
      appointmentId: scheduledAppointment.id,
    };
    await useCase.execute(input);
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(1);
    expect(scheduledAppointment.status).toBe("CANCELLED");
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(1);
    expect(firstAvailableSlot.status).toBe("AVAILABLE");
  });

  test("Should throw NotFoundError if appointment does not exist", async () => {
    const input = {
      appointmentId: Uuid.generate().value,
    };
    expect(useCase.execute(input)).rejects.toThrowError("Appointment not found");
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(0);
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(0);
  });

  test("Should throw a DomainError if trying to cancel a completed appointment", async () => {
    const completedAppointment = appointments[1]!;
    const input = {
      appointmentId: completedAppointment.id,
    };
    expect(useCase.execute(input)).rejects.toThrowError("Only scheduled appointments can be cancelled");
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(0);
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(0);
  });

  test("Should not update availability if no matching slot is found", async () => {
    const orphanAppointment = appointments[2]!;
    const input = {
      appointmentId: orphanAppointment.id,
    };
    await useCase.execute(input);
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(1);
    expect(orphanAppointment.status).toBe("CANCELLED");
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(0);
  });
});
