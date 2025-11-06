import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import { SignupUseCase } from "@/application/use-cases/signup.use-case";
import { AuthController } from "@/infrastructure/controllers/auth.controller";
import { InMemoryPatientRepository } from "@/infrastructure/persistence/in-memory/in-memory-patient.repository";
import { InMemoryUserRepository } from "@/infrastructure/persistence/in-memory/in-memory-user.repository";
import { SYMBOLS } from "@/inversify.symbols";
import { Container } from "inversify";

const productionContainer = new Container();

// Repository bindings
productionContainer.bind(InMemoryPatientRepository).toSelf().inSingletonScope();
productionContainer.bind(InMemoryUserRepository).toSelf().inSingletonScope();

// Interface bindings
productionContainer
  .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
  .toService(InMemoryPatientRepository);
productionContainer
  .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
  .toService(InMemoryPatientRepository);
productionContainer
  .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
  .toService(InMemoryUserRepository);
productionContainer
  .bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository)
  .toService(InMemoryUserRepository);

// Use Case bindings
productionContainer
  .bind<SignupUseCase>(SYMBOLS.SignupUseCase)
  .to(SignupUseCase)
  .inTransientScope();

// Controller bindings
productionContainer
  .bind<AuthController>(SYMBOLS.AuthController)
  .to(AuthController)
  .inTransientScope();

export { productionContainer };
