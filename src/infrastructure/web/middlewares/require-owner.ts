import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BadRequestError } from "../../../application/errors/bad-request.error";
import { ForbiddenError } from "../../../application/errors/forbidden.error";
import { UnauthorizedError } from "../../../application/errors/unauthorized.error";

type RequireOwnerOptions = {
  allowAdmin: boolean;
};

@injectable()
export class RequireOwner {
  handle({ allowAdmin }: RequireOwnerOptions = { allowAdmin: false }) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const { id: userId, role } = req.user;
      const ownerId = res.locals.ownerId as string;
      if (!ownerId) throw new BadRequestError("Missing owner field: userId");
      if (userId !== ownerId && !(allowAdmin && role === "ADMIN"))
        throw new ForbiddenError("You are not authorized to access this resource");
      next();
    };
  }
}
