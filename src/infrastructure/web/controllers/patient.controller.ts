import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import z from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { RegisterPatientUseCase } from "../../../application/use-cases/register-patient.use-case";
import type { RegisterUserUseCase } from "../../../application/use-cases/register-user.use-case";
import { HttpStatus } from "../http-status.constants";
import type { RequireAuth } from "../middlewares/require-auth";
import type { RequireRole } from "../middlewares/require-role";

const registerPatientSchema = z.object({
  name: z.string(),
  cpf: z.string(),
  email: z.email(),
  password: z.string(),
});

@injectable()
export class PatientController {
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
      "/patients",
      this.requireAuth.handle.bind(this.requireAuth),
      this.requireRole.handle("ADMIN"),
      this.registerPatient.bind(this),
    );
    return router;
  }

  private async registerPatient(req: Request, res: Response) {
    const body = registerPatientSchema.parse(req.body);
    const output = await this.unitOfWork.transaction(async (container) => {
      const registerUserUseCase = container.get<RegisterUserUseCase>(SYMBOLS.RegisterUserUseCase);
      const registerPatientUseCase = container.get<RegisterPatientUseCase>(SYMBOLS.RegisterPatientUseCase);
      const userOutput = await registerUserUseCase.execute({
        email: body.email,
        password: body.password,
        role: "PATIENT",
      });
      const patientOutput = await registerPatientUseCase.execute({
        name: body.name,
        cpf: body.cpf,
        userId: userOutput.userId,
      });
      return {
        ...userOutput,
        ...patientOutput,
      };
    });
    res.status(HttpStatus.CREATED).json(output);
  }
}
