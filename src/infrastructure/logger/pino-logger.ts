import { injectable } from "inversify";
import pino from "pino";
import type { ILogger } from "../../application/ports/logger";

@injectable()
export class PinoLogger implements ILogger {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });

  info(message: string, meta?: unknown) {
    this.logger.info(meta ?? {}, message);
  }

  error(message: string, meta?: unknown) {
    this.logger.error(meta ?? {}, message);
  }

  warn(message: string, meta?: unknown) {
    this.logger.warn(meta ?? {}, message);
  }

  debug(message: string, meta?: unknown) {
    this.logger.debug(meta ?? {}, message);
  }
}
