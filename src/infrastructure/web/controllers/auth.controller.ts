import { type Request, type Response, Router } from "express";
import { inject, injectable } from "inversify";
import { z } from "zod";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IUnitOfWork } from "../../../application/ports/unit-of-work";
import type { LoginUseCase } from "../../../application/use-cases/login.use-case";
import type { RegisterPatientUseCase } from "../../../application/use-cases/register-patient.use-case";
import type { RegisterUserUseCase } from "../../../application/use-cases/register-user.use-case";
import { HttpStatus } from "../http-status.constants";

const signupSchema = z.object({
  name: z.string(),
  cpf: z.string(),
  email: z.email(),
  password: z.string(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

@injectable()
export class AuthController {
  constructor(
    @inject(SYMBOLS.IUnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @inject(SYMBOLS.LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
  ) {}

  router(): Router {
    const router = Router();
    router.post("/signup", this.signup.bind(this));
    router.post("/login", this.login.bind(this));
    return router;
  }

  private async signup(req: Request, res: Response) {
    const body = signupSchema.parse(req.body);
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

  private async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body);
    const output = await this.loginUseCase.execute(body);
    res.status(HttpStatus.OK).json(output);
  }
}
