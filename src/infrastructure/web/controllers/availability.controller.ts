import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { ListAvailableSlotsUseCase } from "../../../application/use-cases/list-available-slots.use-case";
import type { RegisterAvailabilityUseCase } from "../../../application/use-cases/register-availability.use-case";
import { HttpStatus } from "../http-status.constants";
import type { AttachDoctorUserId } from "../middlewares/attach-doctor-user-id";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireOwner } from "../middlewares/require-owner";
import {
  getAvailableSlotsRequestSchema,
  getAvailableSlotsResponseSchema,
  registerAvailabilityRequestSchema,
  registerAvailabilityResponseSchema,
} from "../schemas/availability.schema";
import { sendResponse } from "../utils/http-helper";

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
    const body = registerAvailabilityRequestSchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerAvailabilityUseCase = container.get<RegisterAvailabilityUseCase>(
        SYMBOLS.RegisterAvailabilityUseCase,
      );
      return await registerAvailabilityUseCase.execute({
        doctorId: body.doctorId,
        startDateTime: body.startDateTime,
        endDateTime: body.endDateTime,
      });
    });
    sendResponse(res, output, registerAvailabilityResponseSchema, HttpStatus.CREATED);
  }

  private async getAvailableSlots(req: Request, res: Response) {
    const { doctorId } = getAvailableSlotsRequestSchema.parse(req.query);
    const output = await this.listAvailableSlotsUseCase.execute({ doctorId });
    sendResponse(res, output, getAvailableSlotsResponseSchema, HttpStatus.OK);
  }
}
