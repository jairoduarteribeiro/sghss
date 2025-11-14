import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IWriteConsultationRepository } from "../../../src/application/ports/repositories/consultation.repository";
import type { RegisterConsultationUseCase } from "../../../src/application/use-cases/register-consultation.use-case";
import type { Consultation } from "../../../src/domain/entities/consultation";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Register Consultation - Use Case", () => {
  let testContainer: Container;
  let useCase: RegisterConsultationUseCase;

  const existingAppointmentId = Uuid.generate();

  const mockWriteConsultationRepository: IWriteConsultationRepository = {
    save: mock(async (_consultation: Consultation) => {}),
    update: mock(async (_consultation: Consultation) => {}),
    clear: mock(async () => {}),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadAppointmentRepository);
    testContainer.unbind(SYMBOLS.IWriteConsultationRepository);
    testContainer
      .bind<IWriteConsultationRepository>(SYMBOLS.IWriteConsultationRepository)
      .toConstantValue(mockWriteConsultationRepository);
    useCase = testContainer.get<RegisterConsultationUseCase>(SYMBOLS.RegisterConsultationUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should register a Consultation successfully", async () => {
    const input = {
      appointmentId: existingAppointmentId.value,
      notes: "Patient reports headaches.",
      diagnosis: "Tension headache",
      prescription: "Ibuprofen 400mg",
      referral: "Neurology department",
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.consultationId).toMatch(UUID7_REGEX);
    expect(output.appointmentId).toBe(existingAppointmentId.value);
    expect(output.notes).toBe(input.notes);
    expect(output.diagnosis).toBe(input.diagnosis);
    expect(output.prescription).toBe(input.prescription);
    expect(output.referral).toBe(input.referral);
    expect(mockWriteConsultationRepository.save).toHaveBeenCalledTimes(1);
  });
});
