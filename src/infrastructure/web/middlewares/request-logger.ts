import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../application/di/inversify.symbols";
import type { ILogger } from "../../../application/ports/logger";
import { Uuid } from "../../../domain/value-objects/uuid";
import { sanitize } from "../utils/sanitize";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

@injectable()
export class RequestLogger {
  constructor(
    @inject(SYMBOLS.Logger)
    private readonly logger: ILogger,
  ) {}

  handle() {
    return (req: Request, res: Response, next: NextFunction) => {
      const correlationId = Uuid.generate().value;
      req.correlationId = correlationId;
      const start = Date.now();
      const safeBody = sanitize(req.body);
      this.logger.info("Incoming request", {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        query: sanitize(req.query),
        body: safeBody,
        userId: req.user?.id,
      });
      const originalSend = res.send.bind(res);
      // biome-ignore lint/suspicious/noExplicitAny: we don't know the exact shape of the data
      res.send = (body?: any) => {
        const duration = Date.now() - start;
        this.logger.info("Outgoing response", {
          correlationId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: duration,
        });
        return originalSend(body);
      };
      next();
    };
  }
}
