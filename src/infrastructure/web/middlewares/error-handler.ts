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
import { errorResponseSchema, errorResponseWithIssuesSchema } from "../schemas/errors.schema";
import { sendResponse } from "../utils/http-helper";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      path: issue.path.filter((p) => typeof p === "string" || typeof p === "number"),
    }));
    return sendResponse(
      res,
      { message: "Invalid request data", issues },
      errorResponseWithIssuesSchema,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  if (err instanceof DomainError || err instanceof BadRequestError) {
    return sendResponse(res, { message: err.message }, errorResponseSchema, HttpStatus.BAD_REQUEST);
  }
  if (err instanceof ConflictError) {
    return sendResponse(res, { message: err.message }, errorResponseSchema, HttpStatus.CONFLICT);
  }
  if (err instanceof InvalidCredentialsError) {
    return sendResponse(res, { message: err.message }, errorResponseSchema, HttpStatus.UNAUTHORIZED);
  }
  if (err instanceof NotFoundError) {
    return sendResponse(res, { message: err.message }, errorResponseSchema, HttpStatus.NOT_FOUND);
  }
  if (err instanceof UnauthorizedError) {
    return sendResponse(res, { message: err.message }, errorResponseSchema, HttpStatus.UNAUTHORIZED);
  }
  if (err instanceof ForbiddenError) {
    return sendResponse(res, { message: err.message }, errorResponseSchema, HttpStatus.FORBIDDEN);
  }
  return sendResponse(res, { message: "Internal server error" }, errorResponseSchema, HttpStatus.INTERNAL_SERVER_ERROR);
}
