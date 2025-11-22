import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import { UnauthorizedError } from "../../../application/errors/unauthorized.error";
import type { IAuthTokenService } from "../../../application/ports/services/auth-token-service";

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

  handle(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedError("Authentication token is missing or invalid");
    const token = authHeader.split(" ")[1];
    if (!token) throw new UnauthorizedError("Authentication token is missing or invalid");
    const payload = this.authTokenService.extract(token);
    if (!payload) throw new UnauthorizedError("Invalid or expired token");
    req.user = { id: payload.userId, role: payload.role };
    next();
  }
}
