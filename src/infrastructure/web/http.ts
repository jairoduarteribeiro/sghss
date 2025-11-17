import express, { type Express } from "express";
import type { Container } from "inversify";
import { SYMBOLS } from "../../application/di/inversify.symbols";
import type { AppointmentController } from "./controllers/appointment.controller";
import type { AuthController } from "./controllers/auth.controller";
import type { AvailabilityController } from "./controllers/availability.controller";
import type { ConsultationController } from "./controllers/consultation.controller";
import type { DoctorController } from "./controllers/doctor.controller";
import type { PatientController } from "./controllers/patient.controller";
import { errorHandler } from "./middlewares/error-handler";
import type { RequestLogger } from "./middlewares/request-logger";

export const createApp = (container: Container): Express => {
  const app = express();
  const requestLogger = container.get<RequestLogger>(SYMBOLS.RequestLogger);
  const authController = container.get<AuthController>(SYMBOLS.AuthController);
  const doctorController = container.get<DoctorController>(SYMBOLS.DoctorController);
  const availabilityController = container.get<AvailabilityController>(SYMBOLS.AvailabilityController);
  const appointmentController = container.get<AppointmentController>(SYMBOLS.AppointmentController);
  const consultationController = container.get<ConsultationController>(SYMBOLS.ConsultationController);
  const patientController = container.get<PatientController>(SYMBOLS.PatientController);

  app.use(express.json());
  app.use(requestLogger.handle());
  app.use("/auth", authController.router());
  app.use(doctorController.router());
  app.use(availabilityController.router());
  app.use(appointmentController.router());
  app.use(consultationController.router());
  app.use(patientController.router());
  app.use(errorHandler);

  return app;
};
