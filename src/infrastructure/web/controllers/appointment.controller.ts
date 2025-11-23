import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import z from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { NotFoundError } from "../../../application/errors/not-found.error";
import type { IReadPatientRepository } from "../../../application/ports/repositories/patient.repository";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { ListPatientAppointmentsUseCase } from "../../../application/use-cases/list-patient-appointments.use-case";
import type { RegisterAppointmentUseCase } from "../../../application/use-cases/register-appointment.use-case";
import { Uuid } from "../../../domain/value-objects/uuid";
import { HttpStatus } from "../http-status.constants";
import type { AttachPatientUserId } from "../middlewares/attach-patient-user-id";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireOwner } from "../middlewares/require-owner";

const registerAppointmentSchema = z.object({
  slotId: z.uuidv7(),
  patientId: z.uuidv7(),
  modality: z.enum(["IN_PERSON", "TELEMEDICINE"]),
});

@injectable()
export class AppointmentController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.RequireAuth)
    private readonly requireAuth: RequireAuth,
    @inject(SYMBOLS.AttachPatientUserId)
    private readonly attachPatientUserId: AttachPatientUserId,
    @inject(SYMBOLS.RequireOwner)
    private readonly requireOwner: RequireOwner,
    @inject(SYMBOLS.IReadPatientRepository)
    private readonly readPatientRepository: IReadPatientRepository,
    @inject(SYMBOLS.ListPatientAppointmentsUseCase)
    private readonly listPatientAppointmentsUseCase: ListPatientAppointmentsUseCase,
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
      this.getPatientAppointments.bind(this),
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
}
