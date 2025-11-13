import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IWriteDoctorRepository } from "../../../../src/application/ports/repositories/doctor.repository";
import type { IWriteUserRepository } from "../../../../src/application/ports/repositories/user.repository";
import { Doctor } from "../../../../src/domain/entities/doctor";
import { User } from "../../../../src/domain/entities/user";
import { Crm } from "../../../../src/domain/value-objects/crm";
import { Email } from "../../../../src/domain/value-objects/email";
import { MedicalSpecialty } from "../../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../../src/domain/value-objects/name";
import { Password } from "../../../../src/domain/value-objects/password";
import { Uuid } from "../../../../src/domain/value-objects/uuid";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import { createApp } from "../../../../src/infrastructure/web/http";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Availability - Controller", async () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let writeUserRepository: IWriteUserRepository;
  let writeDoctorRepository: IWriteDoctorRepository;

  const doctorUser = User.from(Email.from("john.doe@example.com"), await Password.from("Password123!"), "DOCTOR");
  const doctor = Doctor.from(
    Name.from("John Doe"),
    Crm.from("123456-SP"),
    MedicalSpecialty.from("Cardiology"),
    Uuid.fromString(doctorUser.id),
  );

  beforeAll(async () => {
    writeUserRepository = container.get<IWriteUserRepository>(SYMBOLS.IWriteUserRepository);
    writeDoctorRepository = container.get<IWriteDoctorRepository>(SYMBOLS.IWriteDoctorRepository);
    await writeUserRepository.save(doctorUser);
    await writeDoctorRepository.save(doctor);
    app = createApp(container);
    request = supertest(app);
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /availabilities should return 201 with valid input", async () => {
    const input = {
      doctorId: doctor.id,
      startDateTime: "2024-07-01T08:00:00Z",
      endDateTime: "2024-07-01T10:00:00Z",
    };
    const response = await request.post("/availabilities").send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.availabilityId).toMatch(UUID7_REGEX);
    expect(response.body.doctorId).toBe(input.doctorId);
    expect(new Date(response.body.startDateTime).getTime()).toBe(new Date(input.startDateTime).getTime());
    expect(new Date(response.body.endDateTime).getTime()).toBe(new Date(input.endDateTime).getTime());
    expect(response.body.slots).toHaveLength(4);
  });
});
