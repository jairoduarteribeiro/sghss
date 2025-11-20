import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  ConsultationHistoryItem,
  IReadConsultationRepository,
} from "../../../src/application/ports/repositories/consultation.repository";
import type { GetPatientHistoryUseCase } from "../../../src/application/use-cases/get-patient-history.use-case";
import { Appointment } from "../../../src/domain/entities/appointment";
import { Consultation } from "../../../src/domain/entities/consultation";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Slot } from "../../../src/domain/entities/slot";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";
import { DateBuilder } from "../../utils/date-builder";

describe("Get Patient History - Use Case", () => {
  let testContainer: Container;
  let useCase: GetPatientHistoryUseCase;

  const patientId = Uuid.generate();
  const doctor = Doctor.from({
    name: Name.from("Dr. House"),
    crm: Crm.from("123456-SP"),
    specialty: MedicalSpecialty.from("Diagnostic Medicine"),
    userId: Uuid.generate(),
  });
  const slot = Slot.from(
    DateBuilder.now().plusDays(-1).withTime(9, 0).build(),
    DateBuilder.now().plusDays(-1).withTime(9, 30).build(),
    Uuid.generate(),
    "BOOKED",
  );
  const appointment = Appointment.restore(
    Uuid.generate(),
    "COMPLETED",
    "IN_PERSON",
    null,
    Uuid.fromString(slot.id),
    patientId,
  );
  const consultation = Consultation.from({
    appointmentId: Uuid.fromString(appointment.id),
    diagnosis: "Lupus",
    notes: "Patient is lying.",
    prescription: "Vicodin",
    referral: null,
  });
  const historyItem: ConsultationHistoryItem = {
    consultation,
    appointment,
    doctor,
    slot,
  };

  const mockReadConsultationRepository: IReadConsultationRepository = {
    findByAppointmentId: mock(async () => null),
    findAllByPatientId: mock(async (id: Uuid) => {
      return id.value === patientId.value ? [historyItem] : [];
    }),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadConsultationRepository);
    testContainer.bind(SYMBOLS.IReadConsultationRepository).toConstantValue(mockReadConsultationRepository);
    useCase = testContainer.get<GetPatientHistoryUseCase>(SYMBOLS.GetPatientHistoryUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should return the patient history with doctor details and diagnosis", async () => {
    const input = {
      patientId: patientId.value,
    };
    const output = await useCase.execute(input);
    expect(output.patientId).toBe(patientId.value);
    expect(output.history).toHaveLength(1);
    const item = output.history[0];
    expect(item?.consultationId).toBe(consultation.id);
    expect(item?.appointmentDate).toEqual(slot.startDateTime);
    expect(item?.diagnosis).toBe(consultation.diagnosis);
    expect(item?.prescription).toBe(consultation.prescription);
    expect(item?.notes).toBe(consultation.notes);
    expect(item?.referral).toBe(consultation.referral);
    expect(item?.doctorName).toBe(doctor.name);
    expect(item?.specialty).toBe(doctor.specialty);
    expect(item?.status).toBe(appointment.status);
  });

  test("Should return empty history for new patient", async () => {
    const input = {
      patientId: Uuid.generate().value,
    };
    const output = await useCase.execute(input);
    expect(output.history).toHaveLength(0);
  });
});
