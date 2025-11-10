import { Container } from "inversify";
import type { IUnitOfWork } from "../../application/ports/unit-of-work";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../application/ports/repositories/patient.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../application/ports/repositories/user.repository";
import {
  type IAuthTokenService,
  JwtAuthTokenService,
} from "../../application/services/auth-token-service";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterPatientUseCase } from "../../application/use-cases/register-patient.use-case";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { AuthController } from "../web/controllers/auth.controller";
import { type DbClient, db } from "../persistence/drizzle/drizzle-client";
import {
  DrizzleReadPatientRepository,
  DrizzleWritePatientRepository,
} from "../persistence/drizzle/repositories/drizzle-patient.repository";
import { DrizzleUnitOfWork } from "../persistence/drizzle/repositories/drizzle-unit-of-work";
import {
  DrizzleReadUserRepository,
  DrizzleWriteUserRepository,
} from "../persistence/drizzle/repositories/drizzle-user.repository";
import { SYMBOLS } from "../../application/di/inversify.symbols";
import { RegisterDoctorUseCase } from "../../application/use-cases/register-doctor.use-case";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../application/ports/repositories/doctor.repository";
import {
  DrizzleReadDoctorRepository,
  DrizzleWriteDoctorRepository,
} from "../persistence/drizzle/repositories/drizzle-doctor.repository";
import { DoctorController } from "../web/controllers/doctor.controller";
import { RequireAuth } from "../web/middlewares/require-auth";
import { RequireRole } from "../web/middlewares/require-admin";

const container = new Container();

// Database bindings
container.bind<DbClient>(SYMBOLS.DatabaseClient).toConstantValue(db);

// Container binding
container.bind<Container>(SYMBOLS.Container).toConstantValue(container);

// Repository bindings
container
  .bind<IReadDoctorRepository>(SYMBOLS.IReadDoctorRepository)
  .to(DrizzleReadDoctorRepository)
  .inTransientScope();
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
container
  .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
  .to(DrizzleReadUserRepository)
  .inTransientScope();
container
  .bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository)
  .to(DrizzleWriteUserRepository)
  .inTransientScope();

// UnitOfWork binding
container
  .bind<IUnitOfWork>(SYMBOLS.IUnitOfWork)
  .to(DrizzleUnitOfWork)
  .inSingletonScope();

// Use Case bindings
container
  .bind<RegisterUserUseCase>(SYMBOLS.RegisterUserUseCase)
  .to(RegisterUserUseCase)
  .inTransientScope();
container
  .bind<LoginUseCase>(SYMBOLS.LoginUseCase)
  .to(LoginUseCase)
  .inTransientScope();
container
  .bind<RegisterPatientUseCase>(SYMBOLS.RegisterPatientUseCase)
  .to(RegisterPatientUseCase)
  .inTransientScope();
container
  .bind<RegisterDoctorUseCase>(SYMBOLS.RegisterDoctorUseCase)
  .to(RegisterDoctorUseCase)
  .inTransientScope();

// Controller bindings
container
  .bind<AuthController>(SYMBOLS.AuthController)
  .to(AuthController)
  .inTransientScope();
container
  .bind<DoctorController>(SYMBOLS.DoctorController)
  .to(DoctorController)
  .inTransientScope();

// Service bindings
container
  .bind<IAuthTokenService>(SYMBOLS.IAuthTokenService)
  .to(JwtAuthTokenService)
  .inSingletonScope();

// Middleware bindings
container
  .bind<RequireAuth>(SYMBOLS.RequireAuth)
  .to(RequireAuth)
  .inSingletonScope();
container
  .bind<RequireRole>(SYMBOLS.RequireRole)
  .to(RequireRole)
  .inSingletonScope();

export { container };
