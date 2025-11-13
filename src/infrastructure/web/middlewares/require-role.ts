import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { HttpStatus } from "../http-status.constants";

@injectable()
export class RequireRole {
  handle(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
        return;
      }
      if (req.user.role !== requiredRole) {
        res.status(HttpStatus.FORBIDDEN).json({
          message: `Only ${requiredRole.toLowerCase()} users can access this resource`,
        });
        return;
      }
      next();
    };
  }
}
