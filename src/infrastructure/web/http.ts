import express, { type Express } from "express";
import type { Container } from "inversify";
import { SYMBOLS } from "../../application/di/inversify.symbols";
import type { AuthController } from "./controllers/auth.controller";
import type { DoctorController } from "./controllers/doctor.controller";
import { errorHandler } from "./middlewares/error-handler";

export const createApp = (container: Container): Express => {
  const app = express();
  app.use(express.json());

  const authController = container.get<AuthController>(SYMBOLS.AuthController);
  app.use("/auth", authController.router());
  const doctorController = container.get<DoctorController>(
    SYMBOLS.DoctorController
  );
  app.use(doctorController.router());
  app.use(errorHandler);

  return app;
};
