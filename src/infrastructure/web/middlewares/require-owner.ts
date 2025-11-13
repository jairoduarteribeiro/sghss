import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { HttpStatus } from "../http-status.constants";

type RequireOwnerOptions = {
  allowAdmin: boolean;
};

@injectable()
export class RequireOwner {
  handle({ allowAdmin }: RequireOwnerOptions = { allowAdmin: false }) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
        return;
      }
      const { id, role } = req.user;
      const ownerId = req.body.userId as string;
      if (!ownerId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: `Missing owner field: userId` });
        return;
      }
      if (id !== ownerId && !(allowAdmin && role === "ADMIN")) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "You are not authorized to access this resource" });
        return;
      }
      next();
    };
  }
}
