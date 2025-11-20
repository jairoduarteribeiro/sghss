import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IReadAppointmentRepository } from "../../../src/application/ports/repositories/appointment.repository";
import type { ListDoctorAppointmentsUseCase } from "../../../src/application/use-cases/list-doctor-appointments.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("List Doctor Appointments - Use Case", () => {
  let testContainer: Container;
  let useCase: ListDoctorAppointmentsUseCase;

  const doctorId = Uuid.generate();
  const patientId1 = Uuid.generate();
  const patientId2 = Uuid.generate();
  const slotId1 = Uuid.generate();
  const slotId2 = Uuid.generate();
  const appointments: Appointment[] = [
    Appointment.from({ slotId: slotId1, patientId: patientId1, modality: "IN_PERSON" }),
    Appointment.from({
      slotId: slotId2,
      patientId: patientId2,
      modality: "TELEMEDICINE",
      telemedicineLink: "https://meet.vidaplus.com/abc-123",
    }),
  ];

  const mockReadAppointmentRepository: IReadAppointmentRepository = {
    findById: mock(async () => null),
    findByDoctorId: mock(async (id: Uuid) => {
      return id.value === doctorId.value ? appointments : [];
    }),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAppointmentRepository);
    testContainer
      .bind<IReadAppointmentRepository>(SYMBOLS.IReadAppointmentRepository)
      .toConstantValue(mockReadAppointmentRepository);
    useCase = testContainer.get<ListDoctorAppointmentsUseCase>(SYMBOLS.ListDoctorAppointmentsUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should list all appointments for a given doctor", async () => {
    const input = {
      doctorId: doctorId.value,
    };
    const output = await useCase.execute(input);
    expect(mockReadAppointmentRepository.findByDoctorId).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.appointments).toHaveLength(2);
    expect(output.appointments[0]?.appointmentId).toMatch(UUID7_REGEX);
    expect(output.appointments[0]?.status).toBe("SCHEDULED");
    expect(output.appointments[0]?.modality).toBe("IN_PERSON");
    expect(output.appointments[0]?.slotId).toBe(slotId1.value);
    expect(output.appointments[0]?.patientId).toBe(patientId1.value);
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
