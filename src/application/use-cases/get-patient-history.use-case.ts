import { inject, injectable } from "inversify";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadConsultationRepository } from "../ports/repositories/consultation.repository";

type GetPatientHistoryInput = {
  patientId: string;
};

type HistoryItemOutput = {
  consultationId: string;
  appointmentDate: Date;
  status: string;
  doctorName: string;
  specialty: string;
  diagnosis: string | null;
  prescription: string | null;
  notes: string | null;
  referral: string | null;
};

type GetPatientHistoryOutput = {
  patientId: string;
  history: HistoryItemOutput[];
};

@injectable()
export class GetPatientHistoryUseCase {
  constructor(
    @inject(SYMBOLS.IReadConsultationRepository)
    private readonly readConsultationRepository: IReadConsultationRepository,
  ) {}

  async execute(input: GetPatientHistoryInput): Promise<GetPatientHistoryOutput> {
    const patientId = Uuid.fromString(input.patientId);
    const historyItems = await this.readConsultationRepository.findAllByPatientId(patientId);
    const output: HistoryItemOutput[] = historyItems.map((item) => ({
      consultationId: item.consultation.id,
      appointmentDate: item.slot.startDateTime,
      status: item.appointment.status,
      doctorName: item.doctor.name,
      specialty: item.doctor.specialty,
      diagnosis: item.consultation.diagnosis,
      prescription: item.consultation.prescription,
      notes: item.consultation.notes,
      referral: item.consultation.referral,
    }));
    return {
      patientId: patientId.value,
      history: output,
    };
  }
}
