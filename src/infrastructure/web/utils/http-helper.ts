import type { Response } from "express";
import type { ZodType } from "zod";
import { HttpStatus } from "../http-status.constants";

export const sendSuccess = <T>(res: Response, data: T, schema: ZodType<T>, status = HttpStatus.OK) => {
  const sanitizedData = schema.parse(data);
  return res.status(status).json(sanitizedData);
};

export const sendNoContent = (res: Response) => {
  return res.status(HttpStatus.NO_CONTENT).send();
};
