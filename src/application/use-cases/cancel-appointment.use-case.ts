import { inject, injectable } from "inversify";
import { AppError } from "../../domain/errors/app.error";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type {
  IReadAppointmentRepository,
  IWriteAppointmentRepository,
} from "../ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../ports/repositories/availability.repository";

type CancelAppointmentInput = {
  appointmentId: string;
};

@injectable()
export class CancelAppointmentUseCase {
  constructor(
    @inject(SYMBOLS.IReadAppointmentRepository)
    private readonly readAppointmentRepository: IReadAppointmentRepository,
    @inject(SYMBOLS.IWriteAppointmentRepository)
    private readonly writeAppointmentRepository: IWriteAppointmentRepository,
    @inject(SYMBOLS.IReadAvailabilityRepository)
    private readonly readAvailabilityRepository: IReadAvailabilityRepository,
    @inject(SYMBOLS.IWriteAvailabilityRepository)
    private readonly writeAvailabilityRepository: IWriteAvailabilityRepository,
  ) {}

  async execute(input: CancelAppointmentInput): Promise<void> {
    const appointmentId = Uuid.fromString(input.appointmentId);
    const appointment = await this.readAppointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError("Appointment not found");
    }
    appointment.cancel();
    const slotId = Uuid.fromString(appointment.slotId);
    const availability = await this.readAvailabilityRepository.findBySlotId(slotId);
    if (availability) {
      availability.makeSlotAvailable(slotId);
      await this.writeAvailabilityRepository.update(availability);
    }
    await this.writeAppointmentRepository.update(appointment);
  }
}
