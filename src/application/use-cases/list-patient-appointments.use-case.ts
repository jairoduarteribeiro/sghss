import { inject, injectable } from "inversify";
import { Uuid } from "../../domain/value-objects/uuid";
import { SYMBOLS } from "../di/inversify.symbols";
import type { IReadAppointmentRepository } from "../ports/repositories/appointment.repository";

type ListPatientAppointmentsInput = {
  patientId: string;
};

type AppointmentOutput = {
  appointmentId: string;
  status: string;
  modality: string;
  telemedicineLink: string | null;
  startDateTime: Date;
  endDateTime: Date;
  doctorName: string;
  specialty: string;
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
    const appointments = await this.readAppointmentRepository.findByPatientIdWithDetails(patientId);
    const output: AppointmentOutput[] = appointments.map(({ appointment, slot, doctor }) => ({
      appointmentId: appointment.id,
      status: appointment.status,
      modality: appointment.modality,
      telemedicineLink: appointment.telemedicineLink,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      doctorName: doctor.name,
      specialty: doctor.specialty,
    }));
    return {
      patientId: input.patientId,
      appointments: output,
    };
  }
}
