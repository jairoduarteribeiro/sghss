import { inject, injectable } from "inversify";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { RegisterUserUseCase } from "../../../application/use-cases/register-user.use-case";
import { RegisterDoctorUseCase } from "../../../application/use-cases/register-doctor.use-case";
import { HttpStatus } from "../http-status.constants";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireAdmin } from "../middlewares/require-admin";

const registerDoctorSchema = z.object({
  name: z.string(),
  crm: z.string(),
  email: z.string().email(),
  password: z.string(),
});

@injectable()
export class DoctorController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.RequireAuth)
    private readonly requireAuth: RequireAuth,
    @inject(SYMBOLS.RequireAdmin)
    private readonly requireAdmin: RequireAdmin
  ) {}

  router(): Router {
    const router = Router();
    router.post(
      "/doctors",
      this.requireAuth.handle.bind(this.requireAuth),
      this.requireAdmin.handle.bind(this.requireAdmin),
      this.registerDoctor.bind(this)
    );
    return router;
  }

  private async registerDoctor(req: Request, res: Response) {
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerUserUseCase = container.get<RegisterUserUseCase>(
        SYMBOLS.RegisterUserUseCase
      );
      const registerDoctorUseCase = container.get<RegisterDoctorUseCase>(
        SYMBOLS.RegisterDoctorUseCase
      );
      const body = registerDoctorSchema.parse(req.body);
      const userOutput = await registerUserUseCase.execute({
        email: body.email,
        password: body.password,
        role: "DOCTOR",
      });
      const doctorOutput = await registerDoctorUseCase.execute({
        name: body.name,
        crm: body.crm,
        userId: userOutput.userId,
      });
      return {
        ...userOutput,
        ...doctorOutput,
      };
    });
    res.status(HttpStatus.CREATED).json(output);
  }
}
