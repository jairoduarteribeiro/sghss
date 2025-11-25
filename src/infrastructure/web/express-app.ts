import express, { type Express } from "express";
import { inject, injectable } from "inversify";
import swaggerUi from "swagger-ui-express";
import { SYMBOLS } from "../../application/di/inversify.symbols";
import type { AppointmentController } from "./controllers/appointment.controller";
import type { AuthController } from "./controllers/auth.controller";
import type { AvailabilityController } from "./controllers/availability.controller";
import type { ConsultationController } from "./controllers/consultation.controller";
import type { DoctorController } from "./controllers/doctor.controller";
import type { PatientController } from "./controllers/patient.controller";
import { errorHandler } from "./middlewares/error-handler";
import type { RequestLogger } from "./middlewares/request-logger";
import { generateOpenApiDocument } from "./swagger/open-api-registry";
import "./swagger/auth.swagger";
import "./swagger/patient.swagger";

@injectable()
export class ExpressApp {
  constructor(
    @inject(SYMBOLS.RequestLogger) private readonly requestLogger: RequestLogger,
    @inject(SYMBOLS.AuthController) private readonly authController: AuthController,
    @inject(SYMBOLS.DoctorController) private readonly doctorController: DoctorController,
    @inject(SYMBOLS.AvailabilityController) private readonly availabilityController: AvailabilityController,
    @inject(SYMBOLS.AppointmentController) private readonly appointmentController: AppointmentController,
    @inject(SYMBOLS.ConsultationController) private readonly consultationController: ConsultationController,
    @inject(SYMBOLS.PatientController) private readonly patientController: PatientController,
  ) {}

  build(): Express {
    const app = express();
    const document = generateOpenApiDocument();
    app.use(express.json());
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(document));
    app.use(this.requestLogger.handle());
    app.use("/auth", this.authController.router());
    app.use(this.doctorController.router());
    app.use(this.availabilityController.router());
    app.use(this.appointmentController.router());
    app.use(this.consultationController.router());
    app.use(this.patientController.router());
    app.use(errorHandler);
    return app;
  }
}
