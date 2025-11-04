import "reflect-metadata";
import { Container } from "inversify";
import { SYMBOLS } from "@/inversify.symbols";
import { InMemoryPatientRepository } from "tests/fakes/in-memory-patient.repository";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";
import { InMemoryUserRepository } from "@tests/fakes/in-memory-user.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import { SignupUseCase } from "@/application/use-cases/signup.use-case";

const testContainer = new Container();

testContainer.bind(InMemoryPatientRepository).toSelf().inSingletonScope();
testContainer.bind(InMemoryUserRepository).toSelf().inSingletonScope();
testContainer
  .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
  .toService(InMemoryPatientRepository);
testContainer
  .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
  .toService(InMemoryPatientRepository);
testContainer
  .bind<IReadUserRepository>(SYMBOLS.IReadUserRepository)
  .toService(InMemoryUserRepository);
testContainer
  .bind<IWriteUserRepository>(SYMBOLS.IWriteUserRepository)
  .toService(InMemoryUserRepository);
testContainer.bind<SignupUseCase>(SYMBOLS.SignupUseCase).to(SignupUseCase);

export { testContainer };
