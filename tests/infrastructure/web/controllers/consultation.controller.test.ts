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

describe("Consultation - Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;

  let writeUserRepository: IWriteUserRepository;
  let writeAvailabilityRepository: IWriteAvailabilityRepository;

  let doctorToken: string;
  let patientToken: string;

  let doctorId: string;
  let patientId: string;
  let slotId: string;
  let appointmentId: string;

  beforeAll(async () => {
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    writeAvailabilityRepository = container.get(SYMBOLS.IWriteAvailabilityRepository);

    // Create an admin user and obtain token
    const adminUser = User.from(Email.from("admin@example.com"), await Password.from("Password123!"), "ADMIN");
    await writeUserRepository.save(adminUser);

    app = createApp(container);
    request = supertest(app);

    const adminLoginResponse = await request.post("/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });
    const adminToken = adminLoginResponse.body.token;

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

    // Create appointment
    const appointmentInput = {
      slotId,
      patientId,
      modality: "IN_PERSON",
    };
    const appointmentResponse = await request
      .post("/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send(appointmentInput);
    appointmentId = appointmentResponse.body.appointmentId;
  });

  afterEach(async () => {
    await writeAvailabilityRepository.clear();
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /consultations should register a consultation successfully", async () => {
    const input = {
      appointmentId,
      notes: "Patient complains about chest pain.",
      diagnosis: "Possible angina.",
      prescription: "Aspirin 100mg daily.",
      referral: "Cardiology specialist exam.",
    };
    const response = await request.post("/consultations").set("Authorization", `Bearer ${doctorToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.consultationId).toMatch(UUID7_REGEX);
    expect(response.body.appointmentId).toBe(appointmentId);
    expect(response.body.notes).toBe(input.notes);
    expect(response.body.diagnosis).toBe(input.diagnosis);
    expect(response.body.prescription).toBe(input.prescription);
    expect(response.body.referral).toBe(input.referral);
  });
});
