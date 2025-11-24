import { inject, injectable } from "inversify";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadAppointmentRepository } from "../ports/repositories/appointment.repository";

type ListDoctorAppointmentsInput = {
  doctorId: string;
};

type AppointmentOutput = {
  appointmentId: string;
  startDateTime: Date;
  endDateTime: Date;
  status: string;
  modality: string;
  telemedicineLink: string | null;
  patientName: string;
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
    const appointments = await this.readAppointmentRepository.findByDoctorIdWithDetails(doctorId);
    const output = appointments.map(({ appointment, slot, patient }) => ({
      appointmentId: appointment.id,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      status: appointment.status,
      modality: appointment.modality,
      telemedicineLink: appointment.telemedicineLink,
      patientName: patient.name,
    }));
    return {
      doctorId: input.doctorId,
      appointments: output,
    };
  }
}
