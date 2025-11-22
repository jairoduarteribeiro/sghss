import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IWriteAppointmentRepository } from "../../../src/application/ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../src/application/ports/repositories/availability.repository";
import type { IConferenceLinkGenerator } from "../../../src/application/ports/services/conference-link-generator";
import type { RegisterAppointmentUseCase } from "../../../src/application/use-cases/register-appointment.use-case";
import { Availability } from "../../../src/domain/entities/availability";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";

describe("Register Appointment - Use Case", () => {
  let testContainer: Container;
  let useCase: RegisterAppointmentUseCase;

  const doctor = Doctor.from({
    name: Name.from("John Doe"),
    crm: Crm.from("123456-SP"),
    specialty: MedicalSpecialty.from("Cardiology"),
    userId: Uuid.generate(),
  });
  const tomorrow = DateBuilder.tomorrow();
  const availability = Availability.from({
    startDateTime: tomorrow.withTime(10, 0).build(),
    endDateTime: tomorrow.withTime(11, 0).build(),
    doctorId: Uuid.fromString(doctor.id),
  });
  const patientId = Uuid.generate();
  // biome-ignore-start lint/style/noNonNullAssertion: test setup
  const freeSlot = availability.slots[0]!;
  const bookedSlot = availability.slots[1]!;
  // biome-ignore-end lint/style/noNonNullAssertion: test setup
  bookedSlot.book();

  const mockReadAvailabilityRepository: IReadAvailabilityRepository = {
    findByDoctorId: mock(async (_doctorId: Uuid) => []),
    findBySlotId: mock(async (slotId: Uuid) =>
      availability.slots.some((s) => s.id === slotId.value) ? availability : null,
    ),
  };

  const mockWriteAppointmentRepository: IWriteAppointmentRepository = {
    save: mock(async (_appointment) => {}),
    update: mock(async (_appointment) => {}),
    clear: mock(async () => {}),
  };

  const mockWriteAvailabilityRepository: IWriteAvailabilityRepository = {
    save: mock(async (_availability: Availability) => {}),
    update: mock(async (_availability: Availability) => {}),
    clear: mock(async () => {}),
  };

  const mockConferenceLinkGenerator: IConferenceLinkGenerator = {
    generate: mock(() => `https://example.com/meet/${Uuid.generate().value}`),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IWriteAppointmentRepository);
    testContainer.unbind(SYMBOLS.IWriteAvailabilityRepository);
    testContainer.unbind(SYMBOLS.IConferenceLinkGenerator);
    testContainer
      .bind<IReadAvailabilityRepository>(SYMBOLS.IReadAvailabilityRepository)
      .toConstantValue(mockReadAvailabilityRepository);
    testContainer.bind(SYMBOLS.IWriteAppointmentRepository).toConstantValue(mockWriteAppointmentRepository);
    testContainer
      .bind<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository)
      .toConstantValue(mockWriteAvailabilityRepository);
    testContainer.bind(SYMBOLS.IConferenceLinkGenerator).toConstantValue(mockConferenceLinkGenerator);
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

  test("Should register a TELEMEDICINE appointment successfully", async () => {
    const input = {
      slotId: freeSlot.id,
      patientId: patientId.value,
      modality: "TELEMEDICINE" as const,
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.slotId).toBe(freeSlot.id);
    expect(output.patientId).toBe(patientId.value);
    expect(output.doctorId).toBe(doctor.id);
    expect(output.status).toBe("SCHEDULED");
    expect(output.modality).toBe("TELEMEDICINE");
    expect(output.telemedicineLink).not.toBeNull();
    expect(mockWriteAppointmentRepository.save).toHaveBeenCalledTimes(1);
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(1);
    expect(mockConferenceLinkGenerator.generate).toHaveBeenCalledTimes(1);
  });

  test("Should not register an appointment if the slot is already booked", async () => {
    const input = {
      slotId: bookedSlot.id,
      patientId: patientId.value,
      modality: "IN_PERSON" as const,
    };
    expect(useCase.execute(input)).rejects.toThrowError("The slot is already booked");
    expect(mockWriteAppointmentRepository.save).toHaveBeenCalledTimes(0);
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(0);
  });

  test("Should not register an appointment if the availability is not found", async () => {
    const input = {
      slotId: Uuid.generate().value,
      patientId: patientId.value,
      modality: "IN_PERSON" as const,
    };
    expect(useCase.execute(input)).rejects.toThrowError("Not found any availability for the given slot ID");
    expect(mockWriteAppointmentRepository.save).toHaveBeenCalledTimes(0);
    expect(mockWriteAvailabilityRepository.update).toHaveBeenCalledTimes(0);
  });
});
