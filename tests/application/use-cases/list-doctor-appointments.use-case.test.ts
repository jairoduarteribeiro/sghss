import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { ListDoctorAppointmentsUseCase } from "../../../src/application/use-cases/list-doctor-appointments.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { createMockReadAppointmentRepository } from "../../utils/mocks/repositories";

describe("List Doctor Appointments - Use Case", () => {
  let testContainer: Container;
  let useCase: ListDoctorAppointmentsUseCase;

  // Test Data
  const doctorId = Uuid.generate();
  const patientId1 = Uuid.generate();
  const patientId2 = Uuid.generate();
  const slotId1 = Uuid.generate();
  const slotId2 = Uuid.generate();
  const appointment1 = Appointment.from({ slotId: slotId1, patientId: patientId1, modality: "IN_PERSON" });
  const appointment2 = Appointment.from({
    slotId: slotId2,
    patientId: patientId2,
    modality: "TELEMEDICINE",
    telemedicineLink: "https://meet.vidaplus.com/abc-123",
  });
  const appointments: Appointment[] = [appointment1, appointment2];

  // Mock Repositories
  const mockReadAppointmentRepository = createMockReadAppointmentRepository({
    findByDoctorId: mock(async (id: Uuid) => {
      return id.value === doctorId.value ? appointments : [];
    }),
  });

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadAppointmentRepository).toConstantValue(mockReadAppointmentRepository);
    useCase = testContainer.get(SYMBOLS.ListDoctorAppointmentsUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should list all appointments for a given doctor", async () => {
    const input = {
      doctorId: doctorId.value,
    };
    const output = await useCase.execute(input);
    expect(output.appointments).toHaveLength(2);
    expect(output.doctorId).toBe(doctorId.value);
    expect(output.appointments[0]?.appointmentId).toBe(appointment1.id);
    expect(output.appointments[0]?.slotId).toBe(slotId1.value);
    expect(output.appointments[0]?.patientId).toBe(patientId1.value);
    expect(output.appointments[0]?.status).toBe("SCHEDULED");
    expect(output.appointments[0]?.modality).toBe("IN_PERSON");
    expect(output.appointments[0]?.telemedicineLink).toBeNull();
    expect(output.appointments[1]?.appointmentId).toBe(appointment2.id);
    expect(output.appointments[1]?.slotId).toBe(slotId2.value);
    expect(output.appointments[1]?.patientId).toBe(patientId2.value);
    expect(output.appointments[1]?.status).toBe("SCHEDULED");
    expect(output.appointments[1]?.modality).toBe("TELEMEDICINE");
    expect(output.appointments[1]?.telemedicineLink).toBe("https://meet.vidaplus.com/abc-123");
  });

  test("Should return empty list if doctor has no appointments", async () => {
    const input = {
      doctorId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(output.appointments).toHaveLength(0);
  });
});
