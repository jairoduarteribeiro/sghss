import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { BadRequestError } from "../../../application/errors/bad-request.error";
import type { IReadAppointmentRepository } from "../../../application/ports/repositories/appointment.repository";
import { Uuid } from "../../../domain/value-objects/uuid";

@injectable()
export class AttachAppointmentPatientOwner {
  constructor(
    @inject(SYMBOLS.IReadAppointmentRepository)
    private readonly readAppointmentRepository: IReadAppointmentRepository,
  ) {}

  handle() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { appointmentId } = req.body || req.params;
      if (!appointmentId) throw new BadRequestError("Missing field: appointmentId");
      const patientWithUser = await this.readAppointmentRepository.findPatientOwner(Uuid.fromString(appointmentId));
      if (patientWithUser) res.locals.ownerId = patientWithUser.user.id;
      next();
    };
  }
}
