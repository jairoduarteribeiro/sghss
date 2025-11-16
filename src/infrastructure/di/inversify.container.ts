import { Container } from "inversify";
import { SYMBOLS } from "../../application/di/inversify.symbols";
import type {
  IReadAppointmentRepository,
  IWriteAppointmentRepository,
} from "../../application/ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../application/ports/repositories/availability.repository";
import type {
  IReadConsultationRepository,
  IWriteConsultationRepository,
} from "../../application/ports/repositories/consultation.repository";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../application/ports/repositories/doctor.repository";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../application/ports/repositories/patient.repository";
import type { IReadUserRepository, IWriteUserRepository } from "../../application/ports/repositories/user.repository";
import type { IAuthTokenService } from "../../application/ports/services/auth-token-service";
import type { IConferenceLinkGenerator } from "../../application/ports/services/conference-link-generator";
import type { IUnitOfWork } from "../../application/ports/unit-of-work";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterAppointmentUseCase } from "../../application/use-cases/register-appointment.use-case";
import { RegisterAvailabilityUseCase } from "../../application/use-cases/register-availability.use-case";
import { RegisterConsultationUseCase } from "../../application/use-cases/register-consultation.use-case";
import { RegisterDoctorUseCase } from "../../application/use-cases/register-doctor.use-case";
import { RegisterPatientUseCase } from "../../application/use-cases/register-patient.use-case";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { type DbClient, db } from "../persistence/drizzle/drizzle-client";
import {
  DrizzleReadAppointmentRepository,
  DrizzleWriteAppointmentRepository,
} from "../persistence/drizzle/repositories/drizzle-appointment.repository";
import {
  DrizzleReadAvailabilityRepository,
  DrizzleWriteAvailabilityRepository,
} from "../persistence/drizzle/repositories/drizzle-availability.repository";
import {
  DrizzleReadConsultationRepository,
  DrizzleWriteConsultationRepository,
} from "../persistence/drizzle/repositories/drizzle-consultation.repository";
import {
  DrizzleReadDoctorRepository,
  DrizzleWriteDoctorRepository,
} from "../persistence/drizzle/repositories/drizzle-doctor.repository";
import {
  DrizzleReadPatientRepository,
  DrizzleWritePatientRepository,
} from "../persistence/drizzle/repositories/drizzle-patient.repository";
import { DrizzleUnitOfWork } from "../persistence/drizzle/repositories/drizzle-unit-of-work";
import {
  DrizzleReadUserRepository,
  DrizzleWriteUserRepository,
} from "../persistence/drizzle/repositories/drizzle-user.repository";
import { JwtAuthTokenService } from "../services/jwt-auth-token.service";
import { VidaPlusLinkGeneratorService } from "../services/vida-plus-link-generator.service";
import { AppointmentController } from "../web/controllers/appointment.controller";
import { AuthController } from "../web/controllers/auth.controller";
import { AvailabilityController } from "../web/controllers/availability.controller";
import { ConsultationController } from "../web/controllers/consultation.controller";
import { DoctorController } from "../web/controllers/doctor.controller";
import { PatientController } from "../web/controllers/patient.controller";
import { AttachDoctorUserId } from "../web/middlewares/attach-doctor-user-id";
import { AttachPatientUserId } from "../web/middlewares/attach-patient-user-id";
import { RequireAuth } from "../web/middlewares/require-auth";
import { RequireOwner } from "../web/middlewares/require-owner";
import { RequireRole } from "../web/middlewares/require-role";

const container = new Container();

// Database bindings
container.bind<DbClient>(SYMBOLS.DatabaseClient).toConstantValue(db);

// Container binding
container.bind<Container>(SYMBOLS.Container).toConstantValue(container);

// Repository bindings
container.bind<IReadDoctorRepository>(SYMBOLS.IReadDoctorRepository).to(DrizzleReadDoctorRepository).inTransientScope();
container
  .bind<IWriteDoctorRepository>(SYMBOLS.IWriteDoctorRepository)
  .to(DrizzleWriteDoctorRepository)
  .inTransientScope();
container
  .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
  .to(DrizzleReadPatientRepository)
  .inTransientScope();
container
  .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
  .to(DrizzleWritePatientRepository)
  .inTransientScope();
container.bind<IReadUserRepository>(SYMBOLS.IReadUserRepository).to(DrizzleReadUserRepository).inTransientScope();
container.bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository).to(DrizzleWriteUserRepository).inTransientScope();
container
  .bind<IReadAvailabilityRepository>(SYMBOLS.IReadAvailabilityRepository)
  .to(DrizzleReadAvailabilityRepository)
  .inTransientScope();
container
  .bind<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository)
  .to(DrizzleWriteAvailabilityRepository)
  .inTransientScope();
container
  .bind<IReadAppointmentRepository>(SYMBOLS.IReadAppointmentRepository)
  .to(DrizzleReadAppointmentRepository)
  .inTransientScope();
container
  .bind<IWriteAppointmentRepository>(SYMBOLS.IWriteAppointmentRepository)
  .to(DrizzleWriteAppointmentRepository)
  .inTransientScope();
container
  .bind<IReadConsultationRepository>(SYMBOLS.IReadConsultationRepository)
  .to(DrizzleReadConsultationRepository)
  .inTransientScope();
container
  .bind<IWriteConsultationRepository>(SYMBOLS.IWriteConsultationRepository)
  .to(DrizzleWriteConsultationRepository)
  .inTransientScope();

// UnitOfWork binding
container.bind<IUnitOfWork>(SYMBOLS.IUnitOfWork).to(DrizzleUnitOfWork).inSingletonScope();

// Use Case bindings
container.bind<RegisterUserUseCase>(SYMBOLS.RegisterUserUseCase).to(RegisterUserUseCase).inTransientScope();
container.bind<LoginUseCase>(SYMBOLS.LoginUseCase).to(LoginUseCase).inTransientScope();
container.bind<RegisterPatientUseCase>(SYMBOLS.RegisterPatientUseCase).to(RegisterPatientUseCase).inTransientScope();
container.bind<RegisterDoctorUseCase>(SYMBOLS.RegisterDoctorUseCase).to(RegisterDoctorUseCase).inTransientScope();
container
  .bind<RegisterAvailabilityUseCase>(SYMBOLS.RegisterAvailabilityUseCase)
  .to(RegisterAvailabilityUseCase)
  .inTransientScope();
container
  .bind<RegisterAppointmentUseCase>(SYMBOLS.RegisterAppointmentUseCase)
  .to(RegisterAppointmentUseCase)
  .inTransientScope();
container
  .bind<RegisterConsultationUseCase>(SYMBOLS.RegisterConsultationUseCase)
  .to(RegisterConsultationUseCase)
  .inTransientScope();

// Controller bindings
container.bind<AuthController>(SYMBOLS.AuthController).to(AuthController).inTransientScope();
container.bind<DoctorController>(SYMBOLS.DoctorController).to(DoctorController).inTransientScope();
container.bind<AvailabilityController>(SYMBOLS.AvailabilityController).to(AvailabilityController).inTransientScope();
container.bind<AppointmentController>(SYMBOLS.AppointmentController).to(AppointmentController).inTransientScope();
container.bind<ConsultationController>(SYMBOLS.ConsultationController).to(ConsultationController).inTransientScope();
container.bind<PatientController>(SYMBOLS.PatientController).to(PatientController).inTransientScope();

// Service bindings
container.bind<IAuthTokenService>(SYMBOLS.IAuthTokenService).to(JwtAuthTokenService).inSingletonScope();
container
  .bind<IConferenceLinkGenerator>(SYMBOLS.IConferenceLinkGenerator)
  .to(VidaPlusLinkGeneratorService)
  .inSingletonScope();

// Middleware bindings
container.bind<RequireAuth>(SYMBOLS.RequireAuth).to(RequireAuth).inSingletonScope();
container.bind<RequireRole>(SYMBOLS.RequireRole).to(RequireRole).inSingletonScope();
container.bind<RequireOwner>(SYMBOLS.RequireOwner).to(RequireOwner).inSingletonScope();
container.bind<AttachDoctorUserId>(SYMBOLS.AttachDoctorUserId).to(AttachDoctorUserId).inSingletonScope();
container.bind<AttachPatientUserId>(SYMBOLS.AttachPatientUserId).to(AttachPatientUserId).inSingletonScope();

export { container };
