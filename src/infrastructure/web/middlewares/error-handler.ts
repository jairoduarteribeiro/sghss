import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { BadRequestError } from "../../../application/errors/bad-request.error";
import { ConflictError } from "../../../application/errors/conflict.error";
import { ForbiddenError } from "../../../application/errors/forbidden.error";
import { InvalidCredentialsError } from "../../../application/errors/invalid-credentials.error";
import { NotFoundError } from "../../../application/errors/not-found.error";
import { UnauthorizedError } from "../../../application/errors/unauthorized.error";
import { DomainError } from "../../../domain/errors/domain.error";
import { HttpStatus } from "../http-status.constants";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ message: "Invalid request data", issues: err.issues });
  }
  if (err instanceof DomainError || err instanceof BadRequestError) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(HttpStatus.CONFLICT).json({ message: err.message });
  }
  if (err instanceof InvalidCredentialsError) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(HttpStatus.NOT_FOUND).json({ message: err.message });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(HttpStatus.FORBIDDEN).json({ message: err.message });
  }
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
}
