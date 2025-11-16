import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import { z } from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { RegisterDoctorUseCase } from "../../../application/use-cases/register-doctor.use-case";
import type { RegisterUserUseCase } from "../../../application/use-cases/register-user.use-case";
import { HttpStatus } from "../http-status.constants";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireRole } from "../middlewares/require-role";

const registerDoctorSchema = z.object({
  name: z.string(),
  crm: z.string(),
  specialty: z.string(),
  email: z.email(),
  password: z.string(),
});

@injectable()
export class DoctorController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.RequireAuth)
    private readonly requireAuth: RequireAuth,
    @inject(SYMBOLS.RequireRole)
    private readonly requireRole: RequireRole,
  ) {}

  router(): Router {
    const router = Router();
    router.post(
      "/doctors",
      this.requireAuth.handle.bind(this.requireAuth),
      this.requireRole.handle("ADMIN"),
      this.registerDoctor.bind(this),
    );
    return router;
  }

  private async registerDoctor(req: Request, res: Response) {
    const body = registerDoctorSchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerUserUseCase = container.get<RegisterUserUseCase>(SYMBOLS.RegisterUserUseCase);
      const registerDoctorUseCase = container.get<RegisterDoctorUseCase>(SYMBOLS.RegisterDoctorUseCase);
      const userOutput = await registerUserUseCase.execute({
        email: body.email,
        password: body.password,
        role: "DOCTOR",
      });
      const doctorOutput = await registerDoctorUseCase.execute({
        name: body.name,
        crm: body.crm,
        specialty: body.specialty,
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
