import { inject } from "inversify";
import { Appointment } from "../../domain/entities/appointment";
import { ValidationError } from "../../domain/errors/validation.error";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IWriteAppointmentRepository } from "../ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";
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
      const appointment = Appointment.inPerson(Uuid.fromString(input.slotId), Uuid.fromString(input.patientId));
      const readAvailabilityRepository = container.get<IReadAvailabilityRepository>(
        SYMBOLS.IReadAvailabilityRepository,
      );
      const availability = await readAvailabilityRepository.findBySlotId(Uuid.fromString(input.slotId));
      if (!availability) {
        throw new ValidationError("The slot does not belong to any availability");
      }
      const writeAppointmentRepository = container.get<IWriteAppointmentRepository>(
        SYMBOLS.IWriteAppointmentRepository,
      );
      const writeAvailabilityRepository = container.get<IWriteAvailabilityRepository>(
        SYMBOLS.IWriteAvailabilityRepository,
      );
      availability.bookSlot(Uuid.fromString(input.slotId));
      await writeAvailabilityRepository.update(availability);
      await writeAppointmentRepository.save(appointment);
      return {
        appointmentId: appointment.id,
        slotId: appointment.slotId,
        patientId: appointment.patientId,
        doctorId: availability.doctorId,
        status: appointment.status,
        modality: appointment.modality,
        telemedicineLink: null,
      };
    });
  }
}
