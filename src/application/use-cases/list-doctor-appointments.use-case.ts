import { inject, injectable } from "inversify";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadAppointmentRepository } from "../ports/repositories/appointment.repository";

type ListDoctorAppointmentsInput = {
  doctorId: string;
};

type AppointmentOutput = {
  appointmentId: string;
  slotId: string;
  patientId: string;
  status: string;
  modality: string;
  telemedicineLink: string | null;
};

type ListDoctorAppointmentsOutput = {
  doctorId: string;
  appointments: AppointmentOutput[];
};

@injectable()
export class ListDoctorAppointmentsUseCase {
  constructor(
    @inject(SYMBOLS.IReadAppointmentRepository)
    private readonly readAppointmentRepository: IReadAppointmentRepository,
  ) {}

  async execute(input: ListDoctorAppointmentsInput): Promise<ListDoctorAppointmentsOutput> {
    const doctorId = Uuid.fromString(input.doctorId);
    const appointments = await this.readAppointmentRepository.findByDoctorId(doctorId);
    const output: AppointmentOutput[] = appointments.map((appointment) => ({
      appointmentId: appointment.id,
      slotId: appointment.slotId,
      patientId: appointment.patientId,
      status: appointment.status,
      modality: appointment.modality,
      telemedicineLink: appointment.telemedicineLink,
    }));
    return {
      doctorId: input.doctorId,
      appointments: output,
    };
  }
}
