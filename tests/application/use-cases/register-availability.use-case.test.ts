import { beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../../../src/application/ports/repositories/availability.repository";
import type { RegisterAvailabilityUseCase } from "../../../src/application/use-cases/register-availability.use-case";
import type { Availability } from "../../../src/domain/entities/availability";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

describe("Register Availability - Use Case", async () => {
  let testContainer: Container;
  let useCase: RegisterAvailabilityUseCase;

  const mockWriteAvailabilityRepository: IWriteAvailabilityRepository = {
    save: mock(async (_availability: Availability) => {}),
  };

  beforeAll(async () => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IWriteAvailabilityRepository);
    testContainer
      .bind<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository)
      .toConstantValue(mockWriteAvailabilityRepository);
    useCase = testContainer.get<RegisterAvailabilityUseCase>(SYMBOLS.RegisterAvailabilityUseCase);
  });

  test("Should register an Availability successfully", async () => {
    const doctorId = Uuid.generate();
    const input = {
      doctorId: doctorId.value,
      startDateTime: new Date("2024-07-01T09:00:00Z"),
      endDateTime: new Date("2024-07-01T12:00:00Z"),
    };
    const output = await useCase.execute(input);
    expect(mockWriteAvailabilityRepository.save).toHaveBeenCalledTimes(1);
    expect(output).toBeDefined();
    expect(output.doctorId).toBe(doctorId.value);
    expect(output.startDateTime).toBe(input.startDateTime);
    expect(output.endDateTime).toBe(input.endDateTime);
  });
});
