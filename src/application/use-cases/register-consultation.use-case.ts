import { inject, injectable } from "inversify";
import { Consultation } from "../../domain/entities/consultation";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IWriteConsultationRepository } from "../ports/repositories/consultation.repository";

type RegisterConsultationInput = {
  appointmentId: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  referral?: string;
};

type RegisterConsultationOutput = {
  consultationId: string;
  appointmentId: string;
  notes: string | null;
  diagnosis: string | null;
  prescription: string | null;
  referral: string | null;
};

@injectable()
export class RegisterConsultationUseCase {
  constructor(
    @inject(SYMBOLS.IWriteConsultationRepository)
    private readonly writeConsultationRepository: IWriteConsultationRepository,
  ) {}

  async execute(input: RegisterConsultationInput): Promise<RegisterConsultationOutput> {
    const appointmentId = Uuid.fromString(input.appointmentId);
    const consultation = Consultation.from({
      ...input,
      appointmentId,
    });
    await this.writeConsultationRepository.save(consultation);
    return {
      consultationId: consultation.id,
      appointmentId: consultation.appointmentId,
      notes: consultation.notes,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription,
      referral: consultation.referral,
    };
  }
}
