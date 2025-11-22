import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { ForbiddenError } from "../../../application/errors/forbidden.error";
import { UnauthorizedError } from "../../../application/errors/unauthorized.error";

@injectable()
export class RequireRole {
  handle(requiredRole: string) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      if (req.user.role !== requiredRole)
        throw new ForbiddenError(`Only ${requiredRole.toLowerCase()} users can access this resource`);
      next();
    };
  }
}
