import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { BadRequestError } from "../../../application/errors/bad-request.error";
import { NotFoundError } from "../../../application/errors/not-found.error";
import type { IReadPatientRepository } from "../../../application/ports/repositories/patient.repository";
import { Uuid } from "../../../domain/value-objects/uuid";

@injectable()
export class AttachPatientUserId {
  constructor(
    @inject(SYMBOLS.IReadPatientRepository)
    private readonly readPatientRepository: IReadPatientRepository,
  ) {}

  handle() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const { patientId } = req.body;
      if (!patientId) throw new BadRequestError("Missing field: patientId");
      const patient = await this.readPatientRepository.findById(Uuid.fromString(patientId));
      if (!patient) throw new NotFoundError("Patient not found");
      req.body.userId = patient.userId;
      next();
    };
  }
}
