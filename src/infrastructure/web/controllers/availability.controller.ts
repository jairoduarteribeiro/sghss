import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import { z } from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { RegisterAvailabilityUseCase } from "../../../application/use-cases/register-availability.use-case";
import { HttpStatus } from "../http-status.constants";

const registerAvailabilitySchema = z.object({
  doctorId: z.uuidv7(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
});

@injectable()
export class AvailabilityController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  router(): Router {
    const router = Router();
    router.post("/availabilities", this.registerAvailability.bind(this));
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
}
