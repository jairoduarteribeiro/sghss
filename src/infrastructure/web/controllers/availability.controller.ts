import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import { z } from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { ListAvailableSlotsUseCase } from "../../../application/use-cases/list-available-slots.use-case";
import type { RegisterAvailabilityUseCase } from "../../../application/use-cases/register-availability.use-case";
import { HttpStatus } from "../http-status.constants";
import type { AttachDoctorUserId } from "../middlewares/attach-doctor-user-id";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireOwner } from "../middlewares/require-owner";

const registerAvailabilitySchema = z.object({
  doctorId: z.uuidv7(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
});

const getAvailableSlotsSchema = z.object({
  doctorId: z.uuidv7(),
});

@injectable()
export class AvailabilityController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.RequireAuth)
    private readonly requireAuth: RequireAuth,
    @inject(SYMBOLS.AttachDoctorUserId)
    private readonly attachDoctorUserId: AttachDoctorUserId,
    @inject(SYMBOLS.RequireOwner)
    private readonly requireOwner: RequireOwner,
    @inject(SYMBOLS.ListAvailableSlotsUseCase)
    private readonly listAvailableSlotsUseCase: ListAvailableSlotsUseCase,
  ) {}

  router(): Router {
    const router = Router();
    router.post(
      "/availabilities",
      this.requireAuth.handle.bind(this.requireAuth),
      this.attachDoctorUserId.handle(),
      this.requireOwner.handle({ allowAdmin: true }),
      this.registerAvailability.bind(this),
    );
    router.get("/availabilities", this.requireAuth.handle.bind(this.requireAuth), this.getAvailableSlots.bind(this));
    return router;
  }

  private async registerAvailability(req: Request, res: Response) {
    const body = registerAvailabilitySchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerAvailabilityUseCase = container.get<RegisterAvailabilityUseCase>(
        SYMBOLS.RegisterAvailabilityUseCase,
      );
      const availabilityOutput = await registerAvailabilityUseCase.execute({
        doctorId: body.doctorId,
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
      });
      return {
        ...availabilityOutput,
      };
    });
    res.status(HttpStatus.CREATED).send(output);
  }

  private async getAvailableSlots(req: Request, res: Response) {
    const { doctorId } = getAvailableSlotsSchema.parse(req.query);
    const output = await this.listAvailableSlotsUseCase.execute({ doctorId });
    res.status(HttpStatus.OK).send(output);
  }
}
