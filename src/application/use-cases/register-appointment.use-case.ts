import { inject } from "inversify";
import { Appointment } from "../../domain/entities/appointment";
import { AppError } from "../../domain/errors/app.error";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IWriteAppointmentRepository } from "../ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";
import type { IConferenceLinkGenerator } from "../ports/services/conference-link-generator";
import type { IUnitOfWork } from "../ports/unit-of-work";

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
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: RegisterAppointmentInput): Promise<RegisterAppointmentOutput> {
    return this.unitOfWork.transaction(async (container) => {
      const slotId = Uuid.fromString(input.slotId);
      const readAvailabilityRepository = container.get<IReadAvailabilityRepository>(
        SYMBOLS.IReadAvailabilityRepository,
      );
      const availability = await readAvailabilityRepository.findBySlotId(slotId);
      if (!availability?.isSlotAvailable(slotId)) {
        throw new AppError("The slot is already booked");
      }
      availability.bookSlot(slotId);
      const writeAvailabilityRepository = container.get<IWriteAvailabilityRepository>(
        SYMBOLS.IWriteAvailabilityRepository,
      );
      await writeAvailabilityRepository.update(availability);
      const patientId = Uuid.fromString(input.patientId);
      const conferenceLinkGenerator = container.get<IConferenceLinkGenerator>(SYMBOLS.IConferenceLinkGenerator);
      const appointment =
        input.modality === "IN_PERSON"
          ? Appointment.inPerson(slotId, patientId)
          : Appointment.telemedicine(slotId, patientId, conferenceLinkGenerator.generate());
      const writeAppointmentRepository = container.get<IWriteAppointmentRepository>(
        SYMBOLS.IWriteAppointmentRepository,
      );
      await writeAppointmentRepository.save(appointment);
      return {
        appointmentId: appointment.id,
        slotId: appointment.slotId,
        patientId: appointment.patientId,
        doctorId: availability.doctorId,
        status: appointment.status,
        modality: appointment.modality,
        telemedicineLink: appointment.telemedicineLink,
      };
    });
  }
}
