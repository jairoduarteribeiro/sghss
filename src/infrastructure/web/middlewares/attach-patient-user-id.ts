import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IReadPatientRepository } from "../../../application/ports/repositories/patient.repository";
import { Uuid } from "../../../domain/value-objects/uuid";
import { HttpStatus } from "../http-status.constants";

@injectable()
export class AttachPatientUserId {
  constructor(
    @inject(SYMBOLS.IReadPatientRepository)
    private readonly readPatientRepository: IReadPatientRepository,
  ) {}

  handle() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { patientId } = req.body;
      if (!patientId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Missing field: patientId" });
        return;
      }
      const patient = await this.readPatientRepository.findById(Uuid.fromString(patientId));
      if (!patient) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Patient not found" });
        return;
      }
      req.body.userId = patient.userId;
      next();
    };
  }
}
