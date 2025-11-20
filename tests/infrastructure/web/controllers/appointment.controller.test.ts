import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../../../../src/application/ports/repositories/availability.repository";
import type { IWriteUserRepository } from "../../../../src/application/ports/repositories/user.repository";
import { User } from "../../../../src/domain/entities/user";
import { Email } from "../../../../src/domain/value-objects/email";
import { Password } from "../../../../src/domain/value-objects/password";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import { createApp } from "../../../../src/infrastructure/web/http";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Appointment - Controller", async () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let writeUserRepository: IWriteUserRepository;
  let writeAvailabilityRepository: IWriteAvailabilityRepository;
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let slotId: string;
  let patientId: string;
  let doctorId: string;

  beforeAll(async () => {
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    writeAvailabilityRepository = container.get(SYMBOLS.IWriteAvailabilityRepository);

    // Create an admin user and obtain token
    const adminUser = User.from({
      email: Email.from("admin@example.com"),
      password: await Password.from("Password123!"),
      role: "ADMIN",
    });
    await writeUserRepository.save(adminUser);

    app = createApp(container);
    request = supertest(app);

    const adminLoginResponse = await request.post("/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });
    adminToken = adminLoginResponse.body.token;

    // Create a doctor user and obtain token
    const doctorInput = {
      name: "Jane Smith",
      crm: "654321-RJ",
      specialty: "Dermatology",
      email: "jane.smith@example.com",
      password: "Password123!",
    };
    const doctorResponse = await request
      .post("/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(doctorInput);
    doctorId = doctorResponse.body.doctorId;
    const doctorLogin = await request.post("/auth/login").send({
      email: doctorInput.email,
      password: doctorInput.password,
    });
    doctorToken = doctorLogin.body.token;

    // Create a patient user and obtain token
    const patientInput = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const signupResponse = await request.post("/auth/signup").send(patientInput);
    patientId = signupResponse.body.patientId;
    const otherPatientInput = {
      name: "Alice Johnson",
      cpf: "12984180038",
      email: "alice.johnson@example.com",
      password: "Password123!",
    };
    await request.post("/auth/signup").send(otherPatientInput);
    const loginResponse = await request.post("/auth/login").send({
      email: patientInput.email,
      password: patientInput.password,
    });
    patientToken = loginResponse.body.token;
  });

  beforeEach(async () => {
    // Create an availability and obtain slotId of the first slot
    const availabilityInput = {
      doctorId: doctorId,
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
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slotId);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("IN_PERSON");
    expect(response.body.telemedicineLink).toBeNull();
  });

  test("POST /appointments should register a telemedicine appointment successfully", async () => {
    const input = {
      slotId,
      patientId,
      modality: "TELEMEDICINE",
    };
    const response = await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slotId);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("TELEMEDICINE");
    expect(response.body.telemedicineLink).not.toBeNull();
  });

  test("POST /appointments should return 201 when registering an appointment with admin token", async () => {
    const input = {
      slotId,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request.post("/appointments").set("Authorization", `Bearer ${adminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slotId);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("IN_PERSON");
    expect(response.body.telemedicineLink).toBeNull();
  });

  test("POST /appointments should return 401 when the token is missing", async () => {
    const input = {
      slotId,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request.post("/appointments").send(input);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe("Authentication token is missing or invalid");
  });

  test("POST /appointments should return 403 when using a token of a different patient", async () => {
    const otherPatientToken = (
      await request.post("/auth/login").send({
        email: "alice.johnson@example.com",
        password: "Password123!",
      })
    ).body.token;

    const input = {
      slotId,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request
      .post("/appointments")
      .set("Authorization", `Bearer ${otherPatientToken}`)
      .send(input);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe("You are not authorized to access this resource");
  });
});
