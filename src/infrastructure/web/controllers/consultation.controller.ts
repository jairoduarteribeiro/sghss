import { type Request, type Response, Router } from "express";
import { inject } from "inversify";
import z from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { RegisterConsultationUseCase } from "../../../application/use-cases/register-consultation.use-case";
import { HttpStatus } from "../http-status.constants";

const registerConsultationSchema = z.object({
  appointmentId: z.uuidv7(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  referral: z.string().optional(),
});

export class ConsultationController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  router(): Router {
    const router = Router();
    router.post("/consultations", this.registerConsultation.bind(this));
    return router;
  }

  private async registerConsultation(req: Request, res: Response) {
    const body = registerConsultationSchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerConsultationUseCase = container.get<RegisterConsultationUseCase>(
        SYMBOLS.RegisterConsultationUseCase,
      );
      const registerConsultationOutput = await registerConsultationUseCase.execute({
        appointmentId: body.appointmentId,
        notes: body.notes,
        diagnosis: body.diagnosis,
        prescription: body.prescription,
        referral: body.referral,
      });
      return {
        ...registerConsultationOutput,
      };
    });
    res.status(HttpStatus.CREATED).send(output);
  }
}
