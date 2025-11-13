import express, { type Express } from "express";
import type { Container } from "inversify";
import { SYMBOLS } from "../../application/di/inversify.symbols";
import type { AuthController } from "./controllers/auth.controller";
import type { AvailabilityController } from "./controllers/availability.controller";
import type { DoctorController } from "./controllers/doctor.controller";
import { errorHandler } from "./middlewares/error-handler";

export const createApp = (container: Container): Express => {
  const app = express();
  const authController = container.get<AuthController>(SYMBOLS.AuthController);
  const doctorController = container.get<DoctorController>(SYMBOLS.DoctorController);
  const availabilityController = container.get<AvailabilityController>(SYMBOLS.AvailabilityController);

  app.use(express.json());
  app.use("/auth", authController.router());
  app.use(doctorController.router());
  app.use(availabilityController.router());
  app.use(errorHandler);

  return app;
};
