import { afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { RegisterConsultationUseCase } from "../../../src/application/use-cases/register-consultation.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import {
  createMockReadAppointmentRepository,
  createMockWriteAppointmentRepository,
  createMockWriteConsultationRepository,
} from "../../utils/mocks/repositories";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Consultation - Use Case", () => {
  let testContainer: Container;
  let useCase: RegisterConsultationUseCase;

  // Test Data
  let appointment: Appointment;

  // Mock Repositories
  const mockReadAppointmentRepository = createMockReadAppointmentRepository({
    findById: async (id: Uuid) => (id.value === appointment.id ? appointment : null),
  });
  const mockWriteConsultationRepository = createMockWriteConsultationRepository();
  const mockWriteAppointmentRepository = createMockWriteAppointmentRepository();

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IWriteConsultationRepository).toConstantValue(mockWriteConsultationRepository);
    testContainer.bind(SYMBOLS.IReadAppointmentRepository).toConstantValue(mockReadAppointmentRepository);
    testContainer.bind(SYMBOLS.IWriteAppointmentRepository).toConstantValue(mockWriteAppointmentRepository);
    useCase = testContainer.get(SYMBOLS.RegisterConsultationUseCase);
  });

  beforeEach(() => {
    appointment = Appointment.from({
      patientId: Uuid.generate(),
      slotId: Uuid.generate(),
      modality: "IN_PERSON",
    });
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Consultation successfully", async () => {
    const input = {
      appointmentId: appointment.id,
      notes: "Patient reports headaches.",
      diagnosis: "Tension headache",
      prescription: "Ibuprofen 400mg",
      referral: "Neurology department",
    };
    const output = await useCase.execute(input);
    expect(output.consultationId).toMatch(UUID7_REGEX);
    expect(output.appointmentId).toBe(appointment.id);
    expect(output.notes).toBe(input.notes);
    expect(output.diagnosis).toBe(input.diagnosis);
    expect(output.prescription).toBe(input.prescription);
    expect(output.referral).toBe(input.referral);
    expect(appointment.status).toBe("COMPLETED");
    expect(mockWriteConsultationRepository.save).toHaveBeenCalledTimes(1);
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(1);
  });

  test("Should throw NotFoundError if appointment does not exist", async () => {
    const input = {
      appointmentId: Uuid.generate().value,
      notes: "Test",
    };
    expect(useCase.execute(input)).rejects.toThrowError("Appointment not found");
    expect(mockWriteConsultationRepository.save).toHaveBeenCalledTimes(0);
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(0);
  });

  test("Should register a Consultation with minimal data", async () => {
    const input = {
      appointmentId: appointment.id,
    };
    const output = await useCase.execute(input);
    expect(output.consultationId).toMatch(UUID7_REGEX);
    expect(output.appointmentId).toBe(appointment.id);
    expect(output.notes).toBeNull();
    expect(output.diagnosis).toBeNull();
    expect(output.prescription).toBeNull();
    expect(output.referral).toBeNull();
    expect(appointment.status).toBe("COMPLETED");
    expect(mockWriteConsultationRepository.save).toHaveBeenCalledTimes(1);
    expect(mockWriteAppointmentRepository.update).toHaveBeenCalledTimes(1);
  });
});
