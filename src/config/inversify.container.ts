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
import { SignupUseCase } from "@/application/use-cases/signup.use-case";
import { AuthController } from "@/infrastructure/controllers/auth.controller";
import { db } from "@/infrastructure/persistence/drizzle/drizzle-client";
import {
  DrizzleReadUserRepository,
  DrizzleWriteUserRepository,
} from "@/infrastructure/persistence/drizzle/repositories/drizzle-user.repository";
import { InMemoryPatientRepository } from "@/infrastructure/persistence/in-memory/in-memory-patient.repository";
import { SYMBOLS } from "@/inversify.symbols";
import { Container } from "inversify";

const productionContainer = new Container();

// Database bindings
productionContainer.bind(SYMBOLS.DatabaseClient).toConstantValue(db);

// Repository bindings
productionContainer.bind(InMemoryPatientRepository).toSelf().inSingletonScope();
productionContainer.bind(DrizzleReadUserRepository).toSelf().inSingletonScope();
productionContainer
  .bind(DrizzleWriteUserRepository)
  .toSelf()
  .inSingletonScope();

// Interface bindings
productionContainer
  .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
  .toService(InMemoryPatientRepository);
productionContainer
  .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
  .toService(InMemoryPatientRepository);
productionContainer
  .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
  .toService(DrizzleReadUserRepository);
productionContainer
  .bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository)
  .toService(DrizzleWriteUserRepository);

// Use Case bindings
productionContainer
  .bind<SignupUseCase>(SYMBOLS.SignupUseCase)
  .to(SignupUseCase)
  .inTransientScope();
productionContainer
  .bind<LoginUseCase>(SYMBOLS.LoginUseCase)
  .to(LoginUseCase)
  .inTransientScope();

// Controller bindings
productionContainer
  .bind<AuthController>(SYMBOLS.AuthController)
  .to(AuthController)
  .inTransientScope();

// Service bindings
productionContainer
  .bind<IAuthTokenGenerator>(SYMBOLS.IAuthTokenGenerator)
  .to(JwtTokenGenerator)
  .inSingletonScope();

export { productionContainer };
