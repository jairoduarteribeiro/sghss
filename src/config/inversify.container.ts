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
import { db } from "@/infrastructure/persistence/drizzle/drizzle-client";
import {
  DrizzleReadPatientRepository,
  DrizzleWritePatientRepository,
} from "@/infrastructure/persistence/drizzle/repositories/drizzle-patient.repository";
import {
  DrizzleReadUserRepository,
  DrizzleWriteUserRepository,
} from "@/infrastructure/persistence/drizzle/repositories/drizzle-user.repository";
import { SYMBOLS } from "@/inversify.symbols";
import { Container } from "inversify";

const container = new Container();

// Database bindings
container.bind(SYMBOLS.DatabaseClient).toConstantValue(db);

// Repository bindings
container.bind(DrizzleReadPatientRepository).toSelf().inSingletonScope();
container.bind(DrizzleWritePatientRepository).toSelf().inSingletonScope();
container.bind(DrizzleReadUserRepository).toSelf().inSingletonScope();
container.bind(DrizzleWriteUserRepository).toSelf().inSingletonScope();

// Interface bindings
container
  .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
  .toService(DrizzleReadPatientRepository);
container
  .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
  .toService(DrizzleWritePatientRepository);
container
  .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
  .toService(DrizzleReadUserRepository);
container
  .bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository)
  .toService(DrizzleWriteUserRepository);

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
