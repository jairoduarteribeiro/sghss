import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { BadRequestError } from "../../../application/errors/bad-request.error";
import { NotFoundError } from "../../../application/errors/not-found.error";
import type { IReadDoctorRepository } from "../../../application/ports/repositories/doctor.repository";
import { Uuid } from "../../../domain/value-objects/uuid";

@injectable()
export class AttachDoctorUserId {
  constructor(
    @inject(SYMBOLS.IReadDoctorRepository)
    private readonly readDoctorRepository: IReadDoctorRepository,
  ) {}

  handle() {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const { doctorId } = req.body;
      if (!doctorId) throw new BadRequestError("Missing field: doctorId");
      const doctor = await this.readDoctorRepository.findById(Uuid.fromString(doctorId));
      if (!doctor) throw new NotFoundError("Doctor not found");
      req.body.userId = doctor.userId;
      next();
    };
  }
}
