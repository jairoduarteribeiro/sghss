import { inject, injectable } from "inversify";
import type { Appointment } from "../../domain/entities/appointment";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadAppointmentRepository } from "../ports/repositories/appointment.repository";

type ListPatientAppointmentsInput = {
  patientId: string;
};

type AppointmentOutput = {
  appointmentId: string;
  slotId: string;
  status: string;
  modality: string;
  telemedicineLink: string | null;
};

type ListPatientAppointmentsOutput = {
  patientId: string;
  appointments: AppointmentOutput[];
};

@injectable()
export class ListPatientAppointmentsUseCase {
  constructor(
    @inject(SYMBOLS.IReadAppointmentRepository)
    private readonly readAppointmentRepository: IReadAppointmentRepository,
  ) {}

  async execute(input: ListPatientAppointmentsInput): Promise<ListPatientAppointmentsOutput> {
    const patientId = Uuid.fromString(input.patientId);
    const appointments = await this.readAppointmentRepository.findByPatientId(patientId);
    const output: AppointmentOutput[] = appointments.map((appointment: Appointment) => ({
      appointmentId: appointment.id,
      slotId: appointment.slotId,
      patientId: appointment.patientId,
      status: appointment.status,
      modality: appointment.modality,
      telemedicineLink: appointment.telemedicineLink,
    }));
    return {
      patientId: input.patientId,
      appointments: output,
    };
  }
}
