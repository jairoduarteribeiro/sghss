import { afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  IReadAppointmentRepository,
  IWriteAppointmentRepository,
} from "../../../src/application/ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../src/application/ports/repositories/availability.repository";
import type { CancelAppointmentUseCase } from "../../../src/application/use-cases/cancel-appointment.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Availability } from "../../../src/domain/entities/availability";
import { Slot } from "../../../src/domain/entities/slot";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";

describe("Cancel Appointment - Use Case", () => {
  let testContainer: Container;
  let useCase: CancelAppointmentUseCase;

  const doctorId = Uuid.generate();
  const patientId = Uuid.generate();
  const availability = Availability.from({
    startDateTime: DateBuilder.now().plusDays(1).withTime(10, 0).build(),
    endDateTime: DateBuilder.now().plusDays(1).withTime(12, 0).build(),
    doctorId,
  });
  const slot = Slot.from(
    DateBuilder.now().plusDays(1).withTime(10, 0).build(),
    DateBuilder.now().plusDays(1).withTime(10, 30).build(),
    Uuid.fromString(availability.id),
    "BOOKED",
  );
  availability.addSlot(slot);
  let appointment: Appointment;

  const mockReadAppointmentRepository: IReadAppointmentRepository = {
    findById: mock(async (id: Uuid) => (id.value === appointment.id ? appointment : null)),
    findByDoctorId: mock(async () => []),
  };
  const mockWriteAppointmentRepository: IWriteAppointmentRepository = {
    update: mock(async () => {}),
    save: mock(async () => {}),
    clear: mock(async () => {}),
  };
  const mockReadAvailabilityRepository: IReadAvailabilityRepository = {
    findByDoctorId: mock(async () => []),
    findBySlotId: mock(async (id: Uuid) => (id.value === slot.id ? availability : null)),
  };
  const mockWriteAvailabilityRepository: IWriteAvailabilityRepository = {
    save: mock(async () => {}),
    update: mock(async () => {}),
    clear: mock(async () => {}),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAppointmentRepository);
    testContainer.unbind(SYMBOLS.IWriteAppointmentRepository);
    testContainer.unbind(SYMBOLS.IReadAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IWriteAvailabilityRepository);
    testContainer.bind(SYMBOLS.IReadAppointmentRepository).toConstantValue(mockReadAppointmentRepository);
    testContainer.bind(SYMBOLS.IWriteAppointmentRepository).toConstantValue(mockWriteAppointmentRepository);
    testContainer.bind(SYMBOLS.IReadAvailabilityRepository).toConstantValue(mockReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IWriteAvailabilityRepository).toConstantValue(mockWriteAvailabilityRepository);
    useCase = testContainer.get<CancelAppointmentUseCase>(SYMBOLS.CancelAppointmentUseCase);
  });

  beforeEach(() => {
    appointment = Appointment.inPerson(Uuid.fromString(slot.id), patientId);
  });

  afterEach(() => {
    slot.book();
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
