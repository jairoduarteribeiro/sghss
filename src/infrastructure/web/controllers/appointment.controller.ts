import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import z from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { RegisterAppointmentUseCase } from "../../../application/use-cases/register-appointment.use-case";
import { HttpStatus } from "../http-status.constants";

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
  ) {}

  router(): Router {
    const router = Router();
    router.post("/appointments", this.registerAppointment.bind(this));
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
}
