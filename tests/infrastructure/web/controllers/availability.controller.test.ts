import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../../../../src/application/ports/repositories/availability.repository";
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
  let writeAvailabilityRepository: IWriteAvailabilityRepository;
  let doctorToken: string;
  let otherDoctorToken: string;

  const doctorUser = User.from(Email.from("john.doe@example.com"), await Password.from("Password123!"), "DOCTOR");
  const otherDoctorUser = User.from(Email.from("jane.doe@example.com"), await Password.from("Password123!"), "DOCTOR");
  const doctor = Doctor.from(
    Name.from("John Doe"),
    Crm.from("123456-SP"),
    MedicalSpecialty.from("Cardiology"),
    Uuid.fromString(doctorUser.id),
  );
  const otherDoctor = Doctor.from(
    Name.from("Jane Doe"),
    Crm.from("654321-SP"),
    MedicalSpecialty.from("Neurology"),
    Uuid.fromString(otherDoctorUser.id),
  );

  beforeAll(async () => {
    writeUserRepository = container.get<IWriteUserRepository>(SYMBOLS.IWriteUserRepository);
    writeDoctorRepository = container.get<IWriteDoctorRepository>(SYMBOLS.IWriteDoctorRepository);
    writeAvailabilityRepository = container.get<IWriteAvailabilityRepository>(SYMBOLS.IWriteAvailabilityRepository);
    await writeUserRepository.save(doctorUser);
    await writeUserRepository.save(otherDoctorUser);
    await writeDoctorRepository.save(doctor);
    await writeDoctorRepository.save(otherDoctor);
    app = createApp(container);
    request = supertest(app);
    const responseDoctorLogin = await request
      .post("/auth/login")
      .send({ email: doctorUser.email, password: "Password123!" });
    const responseOtherDoctorLogin = await request
      .post("/auth/login")
      .send({ email: otherDoctorUser.email, password: "Password123!" });
    doctorToken = responseDoctorLogin.body.token;
    otherDoctorToken = responseOtherDoctorLogin.body.token;
  });

  afterEach(async () => {
    await writeAvailabilityRepository.clear();
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /availabilities should return 201 with valid input", async () => {
    const input = {
      doctorId: doctor.id,
      startDateTime: "2024-07-01T08:00:00.000Z",
      endDateTime: "2024-07-01T10:00:00.000Z",
    };
    const response = await request.post("/availabilities").set("Authorization", `Bearer ${doctorToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.availabilityId).toMatch(UUID7_REGEX);
    expect(response.body.doctorId).toBe(input.doctorId);
    expect(response.body.startDateTime).toBe(input.startDateTime);
    expect(response.body.endDateTime).toBe(input.endDateTime);
    expect(response.body.slots).toHaveLength(4);
  });

  test("POST /availabilities should return 401 when the token is missing", async () => {
    const input = {
      doctorId: doctor.id,
      startDateTime: "2024-07-01T08:00:00.000Z",
      endDateTime: "2024-07-01T10:00:00.000Z",
    };
    const response = await request.post("/availabilities").send(input);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  test("POST /availabilities should return 403 when a doctor tries to register availability for another doctor", async () => {
    const input = {
      doctorId: doctor.id,
      startDateTime: "2024-07-01T08:00:00.000Z",
      endDateTime: "2024-07-01T10:00:00.000Z",
    };
    const response = await request
      .post("/availabilities")
      .set("Authorization", `Bearer ${otherDoctorToken}`)
      .send(input);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  });
});
