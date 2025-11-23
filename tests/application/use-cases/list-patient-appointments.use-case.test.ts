import { beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { PatientAppointmentWithDetails } from "../../../src/application/ports/repositories/appointment.repository";
import type { ListPatientAppointmentsUseCase } from "../../../src/application/use-cases/list-patient-appointments.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Slot } from "../../../src/domain/entities/slot";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";
import { createMockReadAppointmentRepository } from "../../utils/mocks/repositories";

describe("List Patient Appointments - Use Case", () => {
  let testContainer: Container;
  let useCase: ListPatientAppointmentsUseCase;

  // Test Data
  const doctor = Doctor.from({
    name: Name.from("Dr. House"),
    crm: Crm.from("123456-RJ"),
    specialty: MedicalSpecialty.from("Diagnostic"),
    userId: Uuid.generate(),
  });
  const tomorrow = DateBuilder.tomorrow();
  const slot1 = Slot.from({
    availabilityId: Uuid.generate(),
    startDateTime: tomorrow.withTime(10, 0).build(),
    endDateTime: tomorrow.withTime(10, 30).build(),
  });
  const slot2 = Slot.from({
    availabilityId: Uuid.generate(),
    startDateTime: tomorrow.withTime(11, 0).build(),
    endDateTime: tomorrow.withTime(11, 30).build(),
  });
  const patientId = Uuid.generate();
  const appointment1 = Appointment.from({
    slotId: Uuid.fromString(slot1.id),
    patientId: patientId,
    modality: "IN_PERSON",
  });
  const appointment2 = Appointment.from({
    slotId: Uuid.fromString(slot2.id),
    patientId: patientId,
    modality: "TELEMEDICINE",
    telemedicineLink: "https://meet.vidaplus.com/xyz-789",
  });

  // Mock Repositories
  const dbResults: PatientAppointmentWithDetails[] = [
    {
      appointment: appointment1,
      slot: slot1,
      doctor,
    },
    {
      appointment: appointment2,
      slot: slot2,
      doctor,
    },
  ];
  const mockReadAppointmentRepository = createMockReadAppointmentRepository({
    findByPatientIdWithDetails: mock(async (id: Uuid) => (id.value === patientId.value ? dbResults : [])),
  });

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.bind(SYMBOLS.IReadAppointmentRepository).toConstantValue(mockReadAppointmentRepository);
    useCase = testContainer.get(SYMBOLS.ListPatientAppointmentsUseCase);
  });

  test("Should list all appointments for a given patient", async () => {
    const input = {
      patientId: patientId.value,
    };
    const output = await useCase.execute(input);
    expect(output.appointments).toHaveLength(2);
    expect(output.patientId).toBe(patientId.value);
    expect(output.appointments[0]?.appointmentId).toBe(appointment1.id);
    expect(output.appointments[0]?.status).toBe("SCHEDULED");
    expect(output.appointments[0]?.modality).toBe("IN_PERSON");
    expect(output.appointments[0]?.telemedicineLink).toBeNull();
    expect(output.appointments[0]?.startDateTime).toEqual(slot1.startDateTime);
    expect(output.appointments[0]?.doctorName).toBe(doctor.name);
    expect(output.appointments[0]?.specialty).toBe(doctor.specialty);
    expect(output.appointments[1]?.appointmentId).toBe(appointment2.id);
    expect(output.appointments[1]?.status).toBe("SCHEDULED");
    expect(output.appointments[1]?.modality).toBe("TELEMEDICINE");
    expect(output.appointments[1]?.telemedicineLink).toBe("https://meet.vidaplus.com/xyz-789");
    expect(output.appointments[1]?.startDateTime).toEqual(slot2.startDateTime);
    expect(output.appointments[1]?.doctorName).toBe(doctor.name);
    expect(output.appointments[1]?.specialty).toBe(doctor.specialty);
  });

  test("Should return an empty list if the patient has no appointments", async () => {
    const input = {
      patientId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(output.appointments).toHaveLength(0);
    expect(output.patientId).toBe(input.patientId);
  });
});
