import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../../../../src/application/ports/repositories/availability.repository";
import type { IWriteDoctorRepository } from "../../../../src/application/ports/repositories/doctor.repository";
import type { IWritePatientRepository } from "../../../../src/application/ports/repositories/patient.repository";
import type { IWriteUserRepository } from "../../../../src/application/ports/repositories/user.repository";
import type { IAuthTokenService } from "../../../../src/application/ports/services/auth-token-service";
import { Doctor } from "../../../../src/domain/entities/doctor";
import { Patient } from "../../../../src/domain/entities/patient";
import { Slot } from "../../../../src/domain/entities/slot";
import { User } from "../../../../src/domain/entities/user";
import { Cpf } from "../../../../src/domain/value-objects/cpf";
import { Crm } from "../../../../src/domain/value-objects/crm";
import { Email } from "../../../../src/domain/value-objects/email";
import { MedicalSpecialty } from "../../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../../src/domain/value-objects/name";
import { Password } from "../../../../src/domain/value-objects/password";
import { Uuid } from "../../../../src/domain/value-objects/uuid";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import type { ExpressApp } from "../../../../src/infrastructure/web/express-app";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";
import { DateBuilder } from "../../../utils/date-builder";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Appointment - Controller", async () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;

  // Repositories and Services
  let writeUserRepository: IWriteUserRepository;
  let writeAvailabilityRepository: IWriteAvailabilityRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  let writePatientRepository: IWritePatientRepository;
  let authTokenService: IAuthTokenService;

  // Tokens
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;

  // IDs
  let patientId: string;
  let doctorId: string;

  // Slots
  let slot1: Slot;
  let slot2: Slot;

  const createUserAndGetToken = async (role: "ADMIN" | "DOCTOR" | "PATIENT") => {
    const email = Email.from(`${role.toLowerCase()}${Date.now()}@example.com`);
    const password = await Password.from("Password123!");
    const user = User.from({
      email,
      password,
      role,
    });
    await writeUserRepository.save(user);
    const token = authTokenService.generate({ userId: user.id, role: user.role });
    return { user, token };
  };

  beforeAll(async () => {
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    writeAvailabilityRepository = container.get(SYMBOLS.IWriteAvailabilityRepository);
    writeDoctorRepository = container.get(SYMBOLS.IWriteDoctorRepository);
    writePatientRepository = container.get(SYMBOLS.IWritePatientRepository);
    authTokenService = container.get(SYMBOLS.IAuthTokenService);

    // Create an admin user and obtain token
    const adminData = await createUserAndGetToken("ADMIN");
    adminToken = adminData.token;

    // Create a doctor user and obtain token
    const doctorData = await createUserAndGetToken("DOCTOR");
    const doctor = Doctor.from({
      name: Name.from("Jane Smith"),
      crm: Crm.from("654321-RJ"),
      specialty: MedicalSpecialty.from("Dermatology"),
      userId: Uuid.fromString(doctorData.user.id),
    });
    await writeDoctorRepository.save(doctor);
    doctorId = doctor.id;
    doctorToken = doctorData.token;

    // Create a patient user and obtain token
    const patientData = await createUserAndGetToken("PATIENT");
    const patient = Patient.from({
      name: Name.from("John Doe"),
      cpf: Cpf.from("70000000400"),
      userId: Uuid.fromString(patientData.user.id),
    });
    await writePatientRepository.save(patient);
    patientId = patient.id;
    patientToken = patientData.token;

    // Build Express app and supertest request
    app = container.get<ExpressApp>(SYMBOLS.HttpApp).build();
    request = supertest(app);
  });

  beforeEach(async () => {
    // Create an availability and obtain slotId of the first slot
    const tomorrow = DateBuilder.tomorrow();
    const startDateTime = tomorrow.withTime(10, 0).build();
    const endDateTime = tomorrow.withTime(12, 0).build();
    const availabilityInput = {
      doctorId: doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
    const response = await request
      .post("/availabilities")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send(availabilityInput);
    const slots = response.body.slots;
    slot1 = Slot.restore({
      id: Uuid.fromString(slots[0].slotId),
      availabilityId: Uuid.fromString(slots[0].availabilityId),
      startDateTime: new Date(slots[0].startDateTime),
      endDateTime: new Date(slots[0].endDateTime),
      status: slots[0].status,
    });
    slot2 = Slot.restore({
      id: Uuid.fromString(slots[1].slotId),
      availabilityId: Uuid.fromString(slots[1].availabilityId),
      startDateTime: new Date(slots[1].startDateTime),
      endDateTime: new Date(slots[1].endDateTime),
      status: slots[1].status,
    });
  });

  afterEach(async () => {
    await writeAvailabilityRepository.clear();
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /appointments should register an appointment successfully", async () => {
    const input = {
      slotId: slot1.id,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slot1.id);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("IN_PERSON");
    expect(response.body.telemedicineLink).toBeNull();
  });

  test("POST /appointments should register a telemedicine appointment successfully", async () => {
    const input = {
      slotId: slot1.id,
      patientId,
      modality: "TELEMEDICINE",
    };
    const response = await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slot1.id);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("TELEMEDICINE");
    expect(response.body.telemedicineLink).not.toBeNull();
  });

  test("POST /appointments should return 201 when registering an appointment with admin token", async () => {
    const input = {
      slotId: slot1.id,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request.post("/appointments").set("Authorization", `Bearer ${adminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.appointmentId).toMatch(UUID7_REGEX);
    expect(response.body.slotId).toBe(slot1.id);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.status).toBe("SCHEDULED");
    expect(response.body.modality).toBe("IN_PERSON");
    expect(response.body.telemedicineLink).toBeNull();
  });

  test("POST /appointments should return 401 when the token is missing", async () => {
    const input = {
      slotId: slot1.id,
      patientId,
      modality: "IN_PERSON",
    };
    const response = await request.post("/appointments").send(input);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe("Authentication token is missing or invalid");
  });

  test("POST /appointments should return 403 when using a token of a different patient", async () => {
    const otherPatientData = await createUserAndGetToken("PATIENT");
    const otherPatientToken = otherPatientData.token;
    const input = {
      slotId: slot1.id,
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

  test("GET /appointments/my-appointments should return list of appointments for the logged patient", async () => {
    const input1 = { slotId: slot1.id, patientId, modality: "IN_PERSON" };
    await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input1);
    const input2 = { slotId: slot2.id, patientId, modality: "TELEMEDICINE" };
    await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input2);
    const response = await request.get("/appointments/my-appointments").set("Authorization", `Bearer ${patientToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.appointments).toHaveLength(2);
    const appointment1 = response.body.appointments[0];
    expect(appointment1.appointmentId).toMatch(UUID7_REGEX);
    expect(appointment1.status).toBe("SCHEDULED");
    expect(appointment1.modality).toBe("IN_PERSON");
    expect(appointment1.telemedicineLink).toBeNull();
    expect(appointment1.startDateTime).toBe(slot1.startDateTime.toISOString());
    expect(appointment1.doctorName).toBe("Jane Smith");
    expect(appointment1.specialty).toBe("Dermatology");
    const appointment2 = response.body.appointments[1];
    expect(appointment2.appointmentId).toMatch(UUID7_REGEX);
    expect(appointment2.status).toBe("SCHEDULED");
    expect(appointment2.modality).toBe("TELEMEDICINE");
    expect(appointment2.telemedicineLink).not.toBeNull();
    expect(appointment2.startDateTime).toBe(slot2.startDateTime.toISOString());
    expect(appointment2.doctorName).toBe("Jane Smith");
    expect(appointment2.specialty).toBe("Dermatology");
  });

  test("GET /appointments/doctor-appointments should return list of appointments for the logged doctor", async () => {
    const input1 = { slotId: slot1.id, patientId, modality: "IN_PERSON" };
    await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input1);
    const input2 = { slotId: slot2.id, patientId, modality: "TELEMEDICINE" };
    await request.post("/appointments").set("Authorization", `Bearer ${patientToken}`).send(input2);
    const response = await request
      .get("/appointments/doctor-appointments")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.doctorId).toBe(doctorId);
    expect(response.body.appointments).toHaveLength(2);
    const appointment1 = response.body.appointments[0];
    expect(appointment1.appointmentId).toMatch(UUID7_REGEX);
    expect(appointment1.status).toBe("SCHEDULED");
    expect(appointment1.modality).toBe("IN_PERSON");
    expect(appointment1.telemedicineLink).toBeNull();
    expect(appointment1.startDateTime).toBe(slot1.startDateTime.toISOString());
    expect(appointment1.patientName).toBe("John Doe");
    const appointment2 = response.body.appointments[1];
    expect(appointment2.appointmentId).toMatch(UUID7_REGEX);
    expect(appointment2.status).toBe("SCHEDULED");
    expect(appointment2.modality).toBe("TELEMEDICINE");
    expect(appointment2.telemedicineLink).not.toBeNull();
    expect(appointment2.startDateTime).toBe(slot2.startDateTime.toISOString());
    expect(appointment2.patientName).toBe("John Doe");
  });
});
