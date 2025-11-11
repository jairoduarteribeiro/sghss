import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { IAuthTokenService } from "../../../application/ports/services/auth-token-service";
import { HttpStatus } from "../http-status.constants";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

@injectable()
export class RequireAuth {
  constructor(
    @inject(SYMBOLS.IAuthTokenService)
    private readonly authTokenService: IAuthTokenService,
  ) {}

  handle(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: "Missing token" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: "Missing token" });
      return;
    }
    const payload = this.authTokenService.extract(token);
    if (!payload) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
      return;
    }
    req.user = { id: payload.userId, role: payload.role };
    next();
  }
}
