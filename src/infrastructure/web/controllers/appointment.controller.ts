import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import z from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { NotFoundError } from "../../../application/errors/not-found.error";
import type { IReadDoctorRepository } from "../../../application/ports/repositories/doctor.repository";
import type { IReadPatientRepository } from "../../../application/ports/repositories/patient.repository";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { CancelAppointmentUseCase } from "../../../application/use-cases/cancel-appointment.use-case";
import type { ListDoctorAppointmentsUseCase } from "../../../application/use-cases/list-doctor-appointments.use-case";
import type { ListPatientAppointmentsUseCase } from "../../../application/use-cases/list-patient-appointments.use-case";
import type { RegisterAppointmentUseCase } from "../../../application/use-cases/register-appointment.use-case";
import { Uuid } from "../../../domain/value-objects/uuid";
import { HttpStatus } from "../http-status.constants";
import type { AttachAppointmentPatientOwner } from "../middlewares/attach-appointment-patient-owner";
import type { AttachPatientUserId } from "../middlewares/attach-patient-user-id";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireOwner } from "../middlewares/require-owner";
import type { RequireRole } from "../middlewares/require-role";

const registerAppointmentSchema = z.object({
  slotId: z.uuidv7(),
  patientId: z.uuidv7(),
  modality: z.enum(["IN_PERSON", "TELEMEDICINE"]),
});

const cancelAppointmentSchema = z.object({
  appointmentId: z.uuidv7(),
});

@injectable()
export class AppointmentController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.RequireAuth)
    private readonly requireAuth: RequireAuth,
    @inject(SYMBOLS.RequireRole)
    private readonly requireRole: RequireRole,
    @inject(SYMBOLS.AttachPatientUserId)
    private readonly attachPatientUserId: AttachPatientUserId,
    @inject(SYMBOLS.AttachAppointmentPatientOwner)
    private readonly attachAppointmentPatientOwner: AttachAppointmentPatientOwner,
    @inject(SYMBOLS.RequireOwner)
    private readonly requireOwner: RequireOwner,
    @inject(SYMBOLS.IReadPatientRepository)
    private readonly readPatientRepository: IReadPatientRepository,
    @inject(SYMBOLS.IReadDoctorRepository)
    private readonly readDoctorRepository: IReadDoctorRepository,
    @inject(SYMBOLS.ListPatientAppointmentsUseCase)
    private readonly listPatientAppointmentsUseCase: ListPatientAppointmentsUseCase,
    @inject(SYMBOLS.ListDoctorAppointmentsUseCase)
    private readonly listDoctorAppointmentsUseCase: ListDoctorAppointmentsUseCase,
  ) {}

  router(): Router {
    const router = Router();
    router.post(
      "/appointments",
      this.requireAuth.handle.bind(this.requireAuth),
      this.attachPatientUserId.handle(),
      this.requireOwner.handle({ allowAdmin: true }),
      this.registerAppointment.bind(this),
    );
    router.get(
      "/appointments/my-appointments",
      this.requireAuth.handle.bind(this.requireAuth),
      this.requireRole.handle("PATIENT"),
      this.getPatientAppointments.bind(this),
    );
    router.get(
      "/appointments/doctor-appointments",
      this.requireAuth.handle.bind(this.requireAuth),
      this.requireRole.handle("DOCTOR"),
      this.getDoctorAppointments.bind(this),
    );
    router.patch(
      "/appointments/:appointmentId/cancel",
      this.requireAuth.handle.bind(this.requireAuth),
      this.attachAppointmentPatientOwner.handle(),
      this.requireOwner.handle({ allowAdmin: true }),
      this.cancelAppointment.bind(this),
    );
    return router;
  }

  private async registerAppointment(req: Request, res: Response) {
    const body = registerAppointmentSchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerAppointmentUseCase = container.get<RegisterAppointmentUseCase>(SYMBOLS.RegisterAppointmentUseCase);
      const appointmentOutput = await registerAppointmentUseCase.execute({
        slotId: body.slotId,
        patientId: body.patientId,
        modality: body.modality,
      });
      return {
        ...appointmentOutput,
      };
    });
    res.status(HttpStatus.CREATED).send(output);
  }

  private async getPatientAppointments(req: Request, res: Response) {
    const userId = req.user?.id as string;
    const patient = await this.readPatientRepository.findByUserId(Uuid.fromString(userId));
    if (!patient) {
      throw new NotFoundError("Patient not found for the authenticated user");
    }
    const output = await this.listPatientAppointmentsUseCase.execute({ patientId: patient.id });
    res.status(HttpStatus.OK).send(output);
  }

  private async getDoctorAppointments(req: Request, res: Response) {
    const userId = req.user?.id as string;
    const doctor = await this.readDoctorRepository.findByUserId(Uuid.fromString(userId));
    if (!doctor) {
      throw new NotFoundError("Doctor not found for the authenticated user");
    }
    const output = await this.listDoctorAppointmentsUseCase.execute({ doctorId: doctor.id });
    res.status(HttpStatus.OK).send(output);
  }

  private async cancelAppointment(req: Request, res: Response) {
    const { appointmentId } = cancelAppointmentSchema.parse(req.params);
    await this.unitOfWork.transaction(async (container) => {
      const cancelUseCase = container.get<CancelAppointmentUseCase>(SYMBOLS.CancelAppointmentUseCase);
      await cancelUseCase.execute({ appointmentId });
    });
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
