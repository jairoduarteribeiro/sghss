import "reflect-metadata";
import { Container } from "inversify";
import { SYMBOLS } from "@/inversify.symbols";
import { InMemoryPatientRepository } from "tests/fakes/in-memory-patient.repository";
import { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";

const testContainer = new Container();

testContainer.bind(InMemoryPatientRepository).toSelf().inSingletonScope();
testContainer
  .bind<IReadPatientRepository>(SYMBOLS.IReadPatientRepository)
  .toService(InMemoryPatientRepository);
testContainer
  .bind<IWritePatientRepository>(SYMBOLS.IWritePatientRepository)
  .toService(InMemoryPatientRepository);
testContainer
  .bind<RegisterPatientUseCase>(SYMBOLS.RegisterPatientUseCase)
  .to(RegisterPatientUseCase);

export { testContainer };
