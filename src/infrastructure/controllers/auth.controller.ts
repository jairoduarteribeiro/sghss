import { inject, injectable } from "inversify";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { SYMBOLS } from "@/inversify.symbols";
import type { SignupUseCase } from "@/application/use-cases/signup.use-case";

const signupSchema = z.object({
  name: z.string(),
  cpf: z.string(),
  email: z.email(),
  password: z.string(),
});

@injectable()
export class AuthController {
  constructor(
    @inject(SYMBOLS.SignupUseCase)
    private readonly signupUseCase: SignupUseCase
  ) {}
  router(): Router {
    const router = Router();
    router.post("/signup", this.signup.bind(this));
    return router;
  }

  private async signup(req: Request, res: Response) {
    const body = signupSchema.parse(req.body);
    const output = await this.signupUseCase.execute(body);
    res.status(201).json(output);
  }
}
