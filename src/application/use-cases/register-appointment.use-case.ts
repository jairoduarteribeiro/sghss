import { inject } from "inversify";
import { Appointment } from "../../domain/entities/appointment";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import { ConflictError } from "../errors/conflict.error";
import { NotFoundError } from "../errors/not-found.error";
import type { IWriteAppointmentRepository } from "../ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";
import type { IConferenceLinkGenerator } from "../ports/services/conference-link-generator";

type RegisterAppointmentInput = {
  slotId: string;
  patientId: string;
  modality: "IN_PERSON" | "TELEMEDICINE";
};

type RegisterAppointmentOutput = {
  appointmentId: string;
  slotId: string;
  patientId: string;
  doctorId: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  modality: "IN_PERSON" | "TELEMEDICINE";
  telemedicineLink: string | null;
};

export class RegisterAppointmentUseCase {
  constructor(
    @inject(SYMBOLS.IReadAvailabilityRepository)
    private readonly readAvailabilityRepository: IReadAvailabilityRepository,
    @inject(SYMBOLS.IWriteAvailabilityRepository)
    private readonly writeAvailabilityRepository: IWriteAvailabilityRepository,
    @inject(SYMBOLS.IWriteAppointmentRepository)
    private readonly writeAppointmentRepository: IWriteAppointmentRepository,
    @inject(SYMBOLS.IConferenceLinkGenerator)
    private readonly conferenceLinkGenerator: IConferenceLinkGenerator,
  ) {}

  async execute(input: RegisterAppointmentInput): Promise<RegisterAppointmentOutput> {
    const slotId = Uuid.fromString(input.slotId);
    const availability = await this.readAvailabilityRepository.findBySlotId(slotId);
    if (!availability) {
      throw new NotFoundError("Not found any availability for the given slot ID");
    }
    if (!availability.isSlotAvailable(slotId)) {
      throw new ConflictError("The slot is already booked");
    }
    availability.bookSlot(slotId);
    await this.writeAvailabilityRepository.update(availability);
    const patientId = Uuid.fromString(input.patientId);
    const appointment =
      input.modality === "IN_PERSON"
        ? Appointment.from({ slotId, patientId, modality: "IN_PERSON" })
        : Appointment.from({
            slotId,
            patientId,
            modality: "TELEMEDICINE",
            telemedicineLink: this.conferenceLinkGenerator.generate(),
          });
    await this.writeAppointmentRepository.save(appointment);
    return {
      appointmentId: appointment.id,
      slotId: appointment.slotId,
      patientId: appointment.patientId,
      doctorId: availability.doctorId,
      status: appointment.status,
      modality: appointment.modality,
      telemedicineLink: appointment.telemedicineLink,
    };
  }
}
