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

describe("Appointment - Controller", async () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let writeUserRepository: IWriteUserRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  let writeAvailabilityRepository: IWriteAvailabilityRepository;
  let patientToken: string;
  let slotId: string;
  let patientId: string;
  let doctorId: string;

  beforeAll(async () => {
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    writeDoctorRepository = container.get(SYMBOLS.IWriteDoctorRepository);
    writeAvailabilityRepository = container.get(SYMBOLS.IWriteAvailabilityRepository);

    const doctorUser = User.from(Email.from("doctor@example.com"), await Password.from("Password123!"), "DOCTOR");
    await writeUserRepository.save(doctorUser);
    const doctor = Doctor.from(
      Name.from("Doctor A"),
      Crm.from("123456-SP"),
      MedicalSpecialty.from("Cardiology"),
      Uuid.fromString(doctorUser.id),
    );
    doctorId = doctor.id;
    await writeDoctorRepository.save(doctor);

    app = createApp(container);
    request = supertest(app);

    const newPatientInput = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const signupResponse = await request.post("/auth/signup").send(newPatientInput);
    patientId = signupResponse.body.patientId;
    const loginResponse = await request.post("/auth/login").send({
      email: newPatientInput.email,
      password: newPatientInput.password,
    });
    patientToken = loginResponse.body.token;

    const doctorLogin = await request.post("/auth/login").send({
      email: doctorUser.email,
      password: "Password123!",
    });
    const doctorToken = doctorLogin.body.token;
    const availabilityInput = {
      doctorId: doctor.id,
      startDateTime: "2024-08-01T10:00:00.000Z",
      endDateTime: "2024-08-01T12:00:00.000Z",
    };
    const response = await request
      .post("/availabilities")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send(availabilityInput);
    slotId = response.body.slots[0].slotId;
  });

  afterEach(async () => {
    await writeAvailabilityRepository.clear();
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /appointments should register an appointment successfully", async () => {
    const input = {
      slotId,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input);
    console.log(response.body);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slotId);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("IN_PERSON");
    expect(response.body.telemedicineLink).toBeNull();
  });
});
