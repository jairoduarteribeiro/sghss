import { inject, injectable } from "inversify";
import { Router, type Request, type Response } from "express";
import { ZodError, z } from "zod";
import { ConflictError } from "../../application/errors/conflict.error";
import { InvalidCredentialsError } from "../../application/errors/invalid-credentials.error";
import type { IUnitOfWork } from "../../application/ports/unit-of-work";
import type { LoginUseCase } from "../../application/use-cases/login.use-case";
import type { RegisterPatientUseCase } from "../../application/use-cases/register-patient.use-case";
import type { SignupUseCase } from "../../application/use-cases/signup.use-case";
import { ValidationError } from "../../domain/errors/validation.error";
import { SYMBOLS } from "../../inversify.symbols";
import { HttpStatus } from "../web/http-status.constants";

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
    private readonly loginUseCase: LoginUseCase
  ) {}
  router(): Router {
    const router = Router();
    router.post("/signup", this.signup.bind(this));
    router.post("/login", this.login.bind(this));
    return router;
  }

  private async signup(req: Request, res: Response) {
    const output = await this.unitOfWork.transaction(async (container) => {
      const signupUseCase = container.get<SignupUseCase>(SYMBOLS.SignupUseCase);
      const registerPatientUseCase = container.get<RegisterPatientUseCase>(
        SYMBOLS.RegisterPatientUseCase
      );
      const body = signupSchema.parse(req.body);
      const signupOutput = await signupUseCase.execute({
        email: body.email,
        password: body.password,
        role: "PATIENT",
      });
      const patientOutput = await registerPatientUseCase.execute({
        name: body.name,
        cpf: body.cpf,
        userId: signupOutput.userId,
      });
      return {
        ...signupOutput,
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
