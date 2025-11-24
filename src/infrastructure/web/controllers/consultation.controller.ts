import { type Request, type Response, Router } from "express";
import { inject } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { GetPatientHistoryUseCase } from "../../../application/use-cases/get-patient-history.use-case";
import type { RegisterConsultationUseCase } from "../../../application/use-cases/register-consultation.use-case";
import { HttpStatus } from "../http-status.constants";
import type { AttachPatientUserId } from "../middlewares/attach-patient-user-id";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireOwner } from "../middlewares/require-owner";
import {
  getPatientHistoryRequestSchema,
  getPatientHistoryResponseSchema,
  registerConsultationRequestSchema,
  registerConsultationResponseSchema,
} from "../schemas/consultation.schema";
import { sendResponse } from "../utils/http-helper";

export class ConsultationController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.RequireAuth)
    private readonly requireAuth: RequireAuth,
    @inject(SYMBOLS.RequireOwner)
    private readonly requireOwner: RequireOwner,
    @inject(SYMBOLS.AttachPatientUserId)
    private readonly attachPatientUserId: AttachPatientUserId,
    @inject(SYMBOLS.GetPatientHistoryUseCase)
    private readonly getPatientHistoryUseCase: GetPatientHistoryUseCase,
  ) {}

  router(): Router {
    const router = Router();
    router.post("/consultations", this.registerConsultation.bind(this));
    router.get(
      "/patients/:patientId/history",
      this.requireAuth.handle.bind(this.requireAuth),
      this.attachPatientUserId.handle(),
      this.requireOwner.handle({ allowAdmin: false, allowDoctor: true }),
      this.getPatientHistory.bind(this),
    );
    return router;
  }

  private async registerConsultation(req: Request, res: Response) {
    const body = registerConsultationRequestSchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerConsultationUseCase = container.get<RegisterConsultationUseCase>(
        SYMBOLS.RegisterConsultationUseCase,
      );
      return await registerConsultationUseCase.execute({
        appointmentId: body.appointmentId,
        notes: body.notes,
        diagnosis: body.diagnosis,
        prescription: body.prescription,
        referral: body.referral,
      });
    });
    sendResponse(res, output, registerConsultationResponseSchema, HttpStatus.CREATED);
  }

  private async getPatientHistory(req: Request, res: Response) {
    const { patientId } = getPatientHistoryRequestSchema.parse(req.params);
    const output = await this.getPatientHistoryUseCase.execute({ patientId });
    sendResponse(res, output, getPatientHistoryResponseSchema, HttpStatus.OK);
  }
}
