import type { Request, Response, NextFunction } from "express";
import { injectable } from "inversify";
import { HttpStatus } from "../http-status.constants";

@injectable()
export class RequireAdmin {
  handle(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Authentication required" });
      return;
    }
    if (req.user.role !== "ADMIN") {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: "Only admin users can access this resource" });
      return;
    }
    next();
  }
}
