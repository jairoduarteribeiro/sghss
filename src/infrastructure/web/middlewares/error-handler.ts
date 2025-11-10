import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ConflictError } from "../../../application/errors/conflict.error";
import { ValidationError } from "../../../domain/errors/validation.error";
import { HttpStatus } from "../http-status.constants";
import { InvalidCredentialsError } from "../../../application/errors/invalid-credentials.error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: "Invalid request data", issues: err.issues });
  }
  if (err instanceof ValidationError) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(HttpStatus.CONFLICT).json({ message: err.message });
  }
  if (err instanceof InvalidCredentialsError) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: err.message });
  }
  return res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error" });
}
