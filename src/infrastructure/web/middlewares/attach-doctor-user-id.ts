import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IReadDoctorRepository } from "../../../application/ports/repositories/doctor.repository";
import { Uuid } from "../../../domain/value-objects/uuid";
import { HttpStatus } from "../http-status.constants";

@injectable()
export class AttachDoctorUserId {
  constructor(
    @inject(SYMBOLS.IReadDoctorRepository)
    private readonly readDoctorRepository: IReadDoctorRepository,
  ) {}

  handle() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { doctorId } = req.body;
      if (!doctorId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Missing field: doctorId" });
        return;
      }
      const doctor = await this.readDoctorRepository.findById(Uuid.fromString(doctorId));
      if (!doctor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Doctor not found" });
        return;
      }
      req.body.userId = doctor.userId;
      next();
    };
  }
}
