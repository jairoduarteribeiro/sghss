import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IReadAppointmentRepository } from "../../../src/application/ports/repositories/appointment.repository";
import type { ListPatientAppointmentsUseCase } from "../../../src/application/use-cases/list-patient-appointments.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

describe("List Patient Appointments - Use Case", () => {
  let testContainer: Container;
  let useCase: ListPatientAppointmentsUseCase;

  const patientId = Uuid.generate();
  const slotId1 = Uuid.generate();
  const slotId2 = Uuid.generate();
  const appointment1 = Appointment.from({ slotId: slotId1, patientId: patientId, modality: "IN_PERSON" });
  const appointment2 = Appointment.from({
    slotId: slotId2,
    patientId: patientId,
    modality: "TELEMEDICINE",
    telemedicineLink: "https://meet.vidaplus.com/xyz-789",
  });
  const appointments: Appointment[] = [appointment1, appointment2];

  const mockReadAppointmentRepository: IReadAppointmentRepository = {
    findById: mock(async () => null),
    findByDoctorId: mock(async () => []),
    findByPatientId: mock(async (id: Uuid) => {
      return id.value === patientId.value ? appointments : [];
    }),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAppointmentRepository);
    testContainer
      .bind<IReadAppointmentRepository>(SYMBOLS.IReadAppointmentRepository)
      .toConstantValue(mockReadAppointmentRepository);
    useCase = testContainer.get<ListPatientAppointmentsUseCase>(SYMBOLS.ListPatientAppointmentsUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should list all appointments for a given patient", async () => {
    const input = {
      patientId: patientId.value,
    };
    const output = await useCase.execute(input);
    expect(mockReadAppointmentRepository.findByPatientId).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.appointments).toHaveLength(2);
    expect(output.patientId).toBe(patientId.value);
    expect(output.appointments[0]?.appointmentId).toBe(appointment1.id);
    expect(output.appointments[0]?.slotId).toBe(slotId1.value);
    expect(output.appointments[0]?.status).toBe("SCHEDULED");
    expect(output.appointments[0]?.modality).toBe("IN_PERSON");
    expect(output.appointments[0]?.telemedicineLink).toBeNull();
    expect(output.appointments[1]?.appointmentId).toBe(appointment2.id);
    expect(output.appointments[1]?.slotId).toBe(slotId2.value);
    expect(output.appointments[1]?.status).toBe("SCHEDULED");
    expect(output.appointments[1]?.modality).toBe("TELEMEDICINE");
    expect(output.appointments[1]?.telemedicineLink).toBe("https://meet.vidaplus.com/xyz-789");
  });
});
