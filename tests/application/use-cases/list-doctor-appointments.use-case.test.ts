import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { DoctorAppointmentWithDetails } from "../../../src/application/ports/repositories/appointment.repository";
import type { ListDoctorAppointmentsUseCase } from "../../../src/application/use-cases/list-doctor-appointments.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Patient } from "../../../src/domain/entities/patient";
import { Slot } from "../../../src/domain/entities/slot";
import { Cpf } from "../../../src/domain/value-objects/cpf";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";
import { createMockReadAppointmentRepository } from "../../utils/mocks/repositories";

describe("List Doctor Appointments - Use Case", () => {
  let testContainer: Container;
  let useCase: ListDoctorAppointmentsUseCase;

  // Test Data
  const doctorId = Uuid.generate();
  const availabilityId = Uuid.generate();
  const patient1 = Patient.from({ name: Name.from("John Doe"), cpf: Cpf.from("70000000400"), userId: Uuid.generate() });
  const patient2 = Patient.from({
    name: Name.from("Jane Smith"),
    cpf: Cpf.from("12984180038"),
    userId: Uuid.generate(),
  });
  const tomorrow = DateBuilder.tomorrow();
  const slot1 = Slot.from({
    availabilityId,
    startDateTime: tomorrow.withTime(9, 0).build(),
    endDateTime: tomorrow.withTime(9, 30).build(),
  });
  const slot2 = Slot.from({
    availabilityId,
    startDateTime: tomorrow.withTime(10, 0).build(),
    endDateTime: tomorrow.withTime(10, 30).build(),
  });
  const appointment1 = Appointment.from({
    slotId: Uuid.fromString(slot1.id),
    patientId: Uuid.fromString(patient1.id),
    modality: "IN_PERSON",
  });
  const appointment2 = Appointment.from({
    slotId: Uuid.fromString(slot2.id),
    patientId: Uuid.fromString(patient2.id),
    modality: "TELEMEDICINE",
    telemedicineLink: "https://meet.vidaplus.com/abc-123",
  });

  // Mock Repositories
  const dbResults: DoctorAppointmentWithDetails[] = [
    { appointment: appointment1, patient: patient1, slot: slot1 },
    { appointment: appointment2, patient: patient2, slot: slot2 },
  ];
  const mockReadAppointmentRepository = createMockReadAppointmentRepository({
    findByDoctorIdWithDetails: async (docId: Uuid) => (docId.value === doctorId.value ? dbResults : []),
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
    expect(output.appointments[0]?.startDateTime).toBe(slot1.startDateTime);
    expect(output.appointments[0]?.endDateTime).toBe(slot1.endDateTime);
    expect(output.appointments[0]?.status).toBe("SCHEDULED");
    expect(output.appointments[0]?.modality).toBe("IN_PERSON");
    expect(output.appointments[0]?.telemedicineLink).toBeNull();
    expect(output.appointments[0]?.patientName).toBe(patient1.name);
    expect(output.appointments[1]?.appointmentId).toBe(appointment2.id);
    expect(output.appointments[1]?.startDateTime).toBe(slot2.startDateTime);
    expect(output.appointments[1]?.endDateTime).toBe(slot2.endDateTime);
    expect(output.appointments[1]?.status).toBe("SCHEDULED");
    expect(output.appointments[1]?.modality).toBe("TELEMEDICINE");
    expect(output.appointments[1]?.telemedicineLink).toBe("https://meet.vidaplus.com/abc-123");
    expect(output.appointments[1]?.patientName).toBe(patient2.name);
  });

  test("Should return empty list if doctor has no appointments", async () => {
    const input = {
      doctorId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(output.doctorId).toBe(input.doctorId);
    expect(output.appointments).toHaveLength(0);
  });
});
