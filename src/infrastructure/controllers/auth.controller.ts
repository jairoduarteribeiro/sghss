import { inject, injectable } from "inversify";
import { Router, type Request, type Response } from "express";
import { ZodError, z } from "zod";
import { SYMBOLS } from "@/inversify.symbols";
import type { SignupUseCase } from "@/application/use-cases/signup.use-case";
import { HttpStatus } from "../web/http-status.constants";
import { ValidationError } from "@/domain/errors/validation.error";
import { ConflictError } from "@/application/errors/conflict.error";
import type { LoginUseCase } from "@/application/use-cases/login.use-case";
import { InvalidCredentialsError } from "@/application/errors/invalid-credentials.error";

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
    @inject(SYMBOLS.SignupUseCase)
    private readonly signupUseCase: SignupUseCase,
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
    try {
      const body = signupSchema.parse(req.body);
      const output = await this.signupUseCase.execute(body);
      res.status(HttpStatus.CREATED).json(output);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(HttpStatus.UNPROCESSABLE_ENTITY)
          .json({ message: "Invalid request data", issues: error.issues });
      }
      if (error instanceof ValidationError) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: error.message });
      }
      if (error instanceof ConflictError) {
        return res.status(HttpStatus.CONFLICT).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }

  private async login(req: Request, res: Response) {
    try {
      const body = loginSchema.parse(req.body);
      const output = await this.loginUseCase.execute(body);
      res.status(HttpStatus.OK).json(output);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(HttpStatus.UNPROCESSABLE_ENTITY)
          .json({ message: "Invalid request data", issues: error.issues });
      }
      if (error instanceof InvalidCredentialsError) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }
}
