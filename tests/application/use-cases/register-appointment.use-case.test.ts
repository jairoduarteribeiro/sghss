import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IWriteAppointmentRepository } from "../../../src/application/ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../src/application/ports/repositories/availability.repository";
import type { IConferenceLinkGenerator } from "../../../src/application/ports/services/conference-link-generator";
import type { IUnitOfWork } from "../../../src/application/ports/unit-of-work";
import type { RegisterAppointmentUseCase } from "../../../src/application/use-cases/register-appointment.use-case";
import { Availability } from "../../../src/domain/entities/availability";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Slot } from "../../../src/domain/entities/slot";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

describe("Register Appointment - Use Case", () => {
  let testContainer: Container;
  let useCase: RegisterAppointmentUseCase;

  const doctor = Doctor.from(
    Name.from("John Doe"),
    Crm.from("123456-SP"),
    MedicalSpecialty.from("Cardiology"),
    Uuid.generate(),
  );
  const availability = Availability.from(
    new Date("2024-07-10T09:00:00.000Z"),
    new Date("2024-07-10T11:00:00.000Z"),
    Uuid.fromString(doctor.id),
  );
  const patientId = Uuid.generate();
  const freeSlot = Slot.from(
    new Date("2024-07-10T10:00:00.000Z"),
    new Date("2024-07-10T10:30:00.000Z"),
    Uuid.fromString(availability.id),
  );
  availability.addSlot(freeSlot);

  const mockUnitOfWork: IUnitOfWork = {
    transaction: async <T>(fn: (container: Container) => Promise<T>) => fn(testContainer),
  };

  const mockReadAvailabilityRepository: IReadAvailabilityRepository = {
    findByDoctorId: mock(async (_doctorId: Uuid) => []),
    findBySlotId: mock(async (slotId: Uuid) =>
      availability.slots.some((s) => s.id === slotId.value) ? availability : null,
    ),
  };

  const mockWriteAppointmentRepository: IWriteAppointmentRepository = {
    save: mock(async (_appointment) => {}),
    clear: mock(async () => {}),
  };

  const mockWriteAvailabilityRepository: IWriteAvailabilityRepository = {
    save: mock(async (_availability: Availability) => {}),
    update: mock(async (_availability: Availability) => {}),
    clear: mock(async () => {}),
  };

  const mockConferenceLinkGenerator: IConferenceLinkGenerator = {
    generate: mock((id) => `https://example.com/meet/${id.value}`),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IWriteAppointmentRepository);
    testContainer.unbind(SYMBOLS.IWriteAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IConferenceLinkGenerator);
    testContainer.unbind(SYMBOLS.IUnitOfWork);
    testContainer
      .bind<IReadAvailabilityRepository>(SYMBOLS.IReadAvailabilityRepository)
      .toConstantValue(mockReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IWriteAppointmentRepository).toConstantValue(mockWriteAppointmentRepository);
    testContainer
      .bind<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository)
      .toConstantValue(mockWriteAvailabilityRepository);
    testContainer.bind(SYMBOLS.IConferenceLinkGenerator).toConstantValue(mockConferenceLinkGenerator);
    testContainer.bind(SYMBOLS.IUnitOfWork).toConstantValue(mockUnitOfWork);
    useCase = testContainer.get<RegisterAppointmentUseCase>(SYMBOLS.RegisterAppointmentUseCase);
  });

  afterEach(() => {
    freeSlot.makeAvailable();
    mock.clearAllMocks();
  });

  test("Should register an IN_PERSON appointment successfully", async () => {
    const input = {
      slotId: freeSlot.id,
      patientId: patientId.value,
      modality: "IN_PERSON" as const,
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.slotId).toBe(freeSlot.id);
    expect(output.patientId).toBe(patientId.value);
    expect(output.doctorId).toBe(doctor.id);
    expect(output.status).toBe("SCHEDULED");
    expect(output.modality).toBe("IN_PERSON");
    expect(output.telemedicineLink).toBeNull();
    expect(mockWriteAppointmentRepository.save).toHaveBeenCalledTimes(1);
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(1);
    expect(mockConferenceLinkGenerator.generate).toHaveBeenCalledTimes(0);
  });
});
