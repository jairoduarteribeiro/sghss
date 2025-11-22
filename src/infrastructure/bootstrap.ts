import type { Server } from "node:http";
import type { Express } from "express";
import type { Container } from "inversify";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../application/di/inversify.symbols";
import type { ILogger } from "../application/ports/logger";
import type { IReadUserRepository, IWriteUserRepository } from "../application/ports/repositories/user.repository";
import { User } from "../domain/entities/user";
import { Email } from "../domain/value-objects/email";
import { Password } from "../domain/value-objects/password";
import { createApp } from "./web/http";

@injectable()
export class AppBootstrap {
  private server?: Server;
  private isShuttingDown = false;
  private readonly ADMIN_EMAIL = "admin@vidaplus.com";
  private readonly ADMIN_PASSWORD = "Admin123!";
  private readonly PORT = 3000;

  constructor(
    @inject(SYMBOLS.Container) private readonly container: Container,
    @inject(SYMBOLS.Logger) private readonly logger: ILogger,
    @inject(SYMBOLS.IReadUserRepository) private readonly readUserRepo: IReadUserRepository,
    @inject(SYMBOLS.IWriteUserRepository) private readonly writeUserRepo: IWriteUserRepository,
  ) {}

  async start(): Promise<void> {
    try {
      const app = createApp(this.container);
      await this.seedAdmin();
      this.listen(app);
      this.registerShutdownListeners();
    } catch (error) {
      this.logger.error("Fatal error during application startup", { error });
      process.exit(1);
    }
  }

  private async seedAdmin(): Promise<void> {
    const email = Email.from(this.ADMIN_EMAIL);
    const existing = await this.readUserRepo.findByEmail(email);
    if (existing) {
      this.logger.info("Admin user already exists. Skipping seed.", { email: this.ADMIN_EMAIL });
      return;
    }
    this.logger.info("Seeding admin user...");
    const adminUser = User.from({
      email: email,
      password: await Password.from(this.ADMIN_PASSWORD),
      role: "ADMIN",
    });
    await this.writeUserRepo.save(adminUser);
    this.logger.info("Admin user seeded successfully", { email: this.ADMIN_EMAIL });
  }

  private listen(app: Express): void {
    this.server = app.listen(this.PORT, () => {
      this.logger.info(`Server listening on port ${this.PORT}`);
    });
  }

  private registerShutdownListeners(): void {
    const shutdownHandler = async () => await this.shutdown();
    process.on("SIGINT", shutdownHandler);
    process.on("SIGTERM", shutdownHandler);
  }

  private async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    this.logger.info("Graceful shutdown initiated...");
    this.server?.close();
    try {
      this.logger.info("Removing admin user...");
      const email = Email.from(this.ADMIN_EMAIL);
      await this.writeUserRepo.deleteByEmail(email);
      this.logger.info("Admin user removed successfully", { email: this.ADMIN_EMAIL });
    } catch (error) {
      this.logger.error("Error removing admin user during shutdown", { error });
    } finally {
      this.logger.info("Application exited");
      process.exit(0);
    }
  }
}
