import type { IUnitOfWork } from "@/application/ports/unit-of-work";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import {
  JwtTokenGenerator,
  type IAuthTokenGenerator,
} from "@/application/services/auth-token-generator";
import { LoginUseCase } from "@/application/use-cases/login.use-case";
import { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import { SignupUseCase } from "@/application/use-cases/signup.use-case";
import { AuthController } from "@/infrastructure/controllers/auth.controller";
import {
  db,
  type DbClient,
} from "@/infrastructure/persistence/drizzle/drizzle-client";
import {
  DrizzleReadPatientRepository,
  DrizzleWritePatientRepository,
} from "@/infrastructure/persistence/drizzle/repositories/drizzle-patient.repository";
import { DrizzleUnitOfWork } from "@/infrastructure/persistence/drizzle/repositories/drizzle-unit-of-work";
import {
  DrizzleReadUserRepository,
  DrizzleWriteUserRepository,
} from "@/infrastructure/persistence/drizzle/repositories/drizzle-user.repository";
import { SYMBOLS } from "@/inversify.symbols";
import { Container } from "inversify";

const container = new Container();

// Database bindings
container.bind<DbClient>(SYMBOLS.DatabaseClient).toConstantValue(db);

// Container binding
container.bind<Container>(SYMBOLS.Container).toConstantValue(container);

// Repository bindings
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
  .bind<SignupUseCase>(SYMBOLS.SignupUseCase)
  .to(SignupUseCase)
  .inTransientScope();
container
  .bind<LoginUseCase>(SYMBOLS.LoginUseCase)
  .to(LoginUseCase)
  .inTransientScope();
container
  .bind<RegisterPatientUseCase>(SYMBOLS.RegisterPatientUseCase)
  .to(RegisterPatientUseCase)
  .inTransientScope();

// Controller bindings
container
  .bind<AuthController>(SYMBOLS.AuthController)
  .to(AuthController)
  .inTransientScope();

// Service bindings
container
  .bind<IAuthTokenGenerator>(SYMBOLS.IAuthTokenGenerator)
  .to(JwtTokenGenerator)
  .inSingletonScope();

export { container };
