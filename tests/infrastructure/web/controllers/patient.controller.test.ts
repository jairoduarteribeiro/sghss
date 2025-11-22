import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IReadPatientRepository } from "../../../../src/application/ports/repositories/patient.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../../src/application/ports/repositories/user.repository";
import { User } from "../../../../src/domain/entities/user";
import { Cpf } from "../../../../src/domain/value-objects/cpf";
import { Email } from "../../../../src/domain/value-objects/email";
import { Password } from "../../../../src/domain/value-objects/password";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import { createApp } from "../../../../src/infrastructure/web/http";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Patient - Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let readUserRepository: IReadUserRepository;
  let writeUserRepository: IWriteUserRepository;
  let readPatientRepository: IReadPatientRepository;
  let adminToken: string;
  let nonAdminToken: string;

  beforeAll(() => {
    readUserRepository = container.get(SYMBOLS.IReadUserRepository);
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    readPatientRepository = container.get(SYMBOLS.IReadPatientRepository);
    app = createApp(container);
    request = supertest(app);
  });

  beforeEach(async () => {
    const adminUser = User.from({
      email: Email.from("admin@example.com"),
      password: await Password.from("AdminPass123!"),
      role: "ADMIN",
    });
    const nonAdminUser = User.from({
      email: Email.from("nonadmin@example.com"),
      password: await Password.from("NonAdminPass123!"),
      role: "PATIENT",
    });
    await writeUserRepository.save(adminUser);
    await writeUserRepository.save(nonAdminUser);
    const responseAdmin = await request.post("/auth/login").send({
      email: "admin@example.com",
      password: "AdminPass123!",
    });
    const responseNonAdmin = await request.post("/auth/login").send({
      email: "nonadmin@example.com",
      password: "NonAdminPass123!",
    });
    adminToken = responseAdmin.body.token;
    nonAdminToken = responseNonAdmin.body.token;
  });

  afterEach(async () => {
    await writeUserRepository.clear();
  });

  test("POST /patients should return 201 with valid input", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/patients").set("Authorization", `Bearer ${adminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: expect.stringMatching(UUID7_REGEX),
      patientId: expect.stringMatching(UUID7_REGEX),
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      role: "PATIENT",
    });
    const savedUser = await readUserRepository.findByEmail(Email.from(input.email));
    expect(savedUser).not.toBeNull();
    expect(savedUser?.id).toBe(response.body.userId);
    expect(savedUser?.email).toBe(response.body.email);
    expect(savedUser?.role).toBe(response.body.role);
    const savedPatient = await readPatientRepository.findByCpf(Cpf.from(input.cpf));
    expect(savedPatient).not.toBeNull();
    expect(savedPatient?.id).toBe(response.body.patientId);
    expect(savedPatient?.name).toBe(response.body.name);
    expect(savedPatient?.cpf).toBe(response.body.cpf);
  });

  test("POST /patients should return 403 when non admin user tries to register a patient", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/patients").set("Authorization", `Bearer ${nonAdminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe("Only admin users can access this resource");
  });

  test("POST /patients should return 401 when no token is provided", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/patients").send(input);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe("Authentication token is missing or invalid");
  });
});
