import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IWriteAvailabilityRepository } from "../../../../src/application/ports/repositories/availability.repository";
import type { IWriteDoctorRepository } from "../../../../src/application/ports/repositories/doctor.repository";
import type { IWriteUserRepository } from "../../../../src/application/ports/repositories/user.repository";
import type { IAuthTokenService } from "../../../../src/application/ports/services/auth-token-service";
import { Doctor } from "../../../../src/domain/entities/doctor";
import { User } from "../../../../src/domain/entities/user";
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

describe("Availability - Controller", async () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;

  // Repositories and services
  let writeUserRepository: IWriteUserRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  let writeAvailabilityRepository: IWriteAvailabilityRepository;
  let authTokenService: IAuthTokenService;

  // Auth tokens & IDs
  let adminToken: string;
  let doctorToken: string;
  let otherDoctorToken: string;
  let doctorId: string;

  const createUserAndGetToken = async (role: "ADMIN" | "DOCTOR" | "PATIENT") => {
    const email = Email.from(`${role.toLowerCase()}${Date.now()}@example.com`);
    const password = await Password.from("Password123!");
    const user = User.from({ email, password, role });
    await writeUserRepository.save(user);
    const token = authTokenService.generate({ userId: user.id, role: user.role });
    return { user, token };
  };

  const tomorrow = DateBuilder.tomorrow();
  const startDateTime = tomorrow.withTime(8, 0).build();
  const endDateTime = tomorrow.withTime(10, 0).build();

  beforeAll(async () => {
    // Get repositories and services
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    writeDoctorRepository = container.get(SYMBOLS.IWriteDoctorRepository);
    writeAvailabilityRepository = container.get(SYMBOLS.IWriteAvailabilityRepository);
    authTokenService = container.get(SYMBOLS.IAuthTokenService);

    // Create users and get tokens
    const adminData = await createUserAndGetToken("ADMIN");
    adminToken = adminData.token;

    const doctorData = await createUserAndGetToken("DOCTOR");
    doctorToken = doctorData.token;
    const doctor = Doctor.from({
      name: Name.from("John Doe"),
      crm: Crm.from("123456-SP"),
      specialty: MedicalSpecialty.from("Cardiology"),
      userId: Uuid.fromString(doctorData.user.id),
    });
    await writeDoctorRepository.save(doctor);
    doctorId = doctor.id;

    const otherDoctorData = await createUserAndGetToken("DOCTOR");
    otherDoctorToken = otherDoctorData.token;
    const otherDoctor = Doctor.from({
      name: Name.from("Jane Doe"),
      crm: Crm.from("654321-SP"),
      specialty: MedicalSpecialty.from("Neurology"),
      userId: Uuid.fromString(otherDoctorData.user.id),
    });
    await writeDoctorRepository.save(otherDoctor);

    // Build app and request
    app = container.get<ExpressApp>(SYMBOLS.HttpApp).build();
    request = supertest(app);
  });

  afterEach(async () => {
    await writeAvailabilityRepository.clear();
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /availabilities should return 201 with valid input", async () => {
    const input = {
      doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
    const response = await request.post("/availabilities").set("Authorization", `Bearer ${doctorToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.availabilityId).toMatch(UUID7_REGEX);
    expect(response.body.doctorId).toBe(input.doctorId);
    expect(response.body.startDateTime).toBe(input.startDateTime);
    expect(response.body.endDateTime).toBe(input.endDateTime);
    expect(response.body.slots).toHaveLength(4);
  });

  test("POST /availabilities should return 201 when using admin token", async () => {
    const input = {
      doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
    const response = await request.post("/availabilities").set("Authorization", `Bearer ${adminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.availabilityId).toMatch(UUID7_REGEX);
    expect(response.body.doctorId).toBe(input.doctorId);
    expect(response.body.startDateTime).toBe(input.startDateTime);
    expect(response.body.endDateTime).toBe(input.endDateTime);
    expect(response.body.slots).toHaveLength(4);
  });

  test("POST /availabilities should return 401 when the token is missing", async () => {
    const input = {
      doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
    const response = await request.post("/availabilities").send(input);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe("Authentication token is missing or invalid");
  });

  test("POST /availabilities should return 403 when a doctor tries to register availability for another doctor", async () => {
    const input = {
      doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
    const response = await request
      .post("/availabilities")
      .set("Authorization", `Bearer ${otherDoctorToken}`)
      .send(input);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe("You are not authorized to access this resource");
  });

  test("GET /availabilities should return 200 with availabilities for a doctor", async () => {
    const input = {
      doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
    await request.post("/availabilities").set("Authorization", `Bearer ${doctorToken}`).send(input);
    const response = await request
      .get("/availabilities")
      .set("Authorization", `Bearer ${doctorToken}`)
      .query({ doctorId });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.doctorId).toBe(doctorId);
    const availableSlots = response.body.availableSlots;
    expect(availableSlots).toHaveLength(4);
    expect(availableSlots[0].slotId).toMatch(UUID7_REGEX);
    expect(availableSlots[0].startDateTime).toBe(tomorrow.withTime(8, 0).build().toISOString());
    expect(availableSlots[0].endDateTime).toBe(tomorrow.withTime(8, 30).build().toISOString());
    expect(availableSlots[0].status).toBe("AVAILABLE");
    expect(availableSlots[1].slotId).toMatch(UUID7_REGEX);
    expect(availableSlots[1].startDateTime).toBe(tomorrow.withTime(8, 30).build().toISOString());
    expect(availableSlots[1].endDateTime).toBe(tomorrow.withTime(9, 0).build().toISOString());
    expect(availableSlots[1].status).toBe("AVAILABLE");
    expect(availableSlots[2].slotId).toMatch(UUID7_REGEX);
    expect(availableSlots[2].startDateTime).toBe(tomorrow.withTime(9, 0).build().toISOString());
    expect(availableSlots[2].endDateTime).toBe(tomorrow.withTime(9, 30).build().toISOString());
    expect(availableSlots[2].status).toBe("AVAILABLE");
    expect(availableSlots[3].slotId).toMatch(UUID7_REGEX);
    expect(availableSlots[3].startDateTime).toBe(tomorrow.withTime(9, 30).build().toISOString());
    expect(availableSlots[3].endDateTime).toBe(tomorrow.withTime(10, 0).build().toISOString());
    expect(availableSlots[3].status).toBe("AVAILABLE");
  });
});
