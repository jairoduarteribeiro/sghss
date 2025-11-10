import {
  describe,
  test,
  expect,
  afterEach,
  beforeAll,
  beforeEach,
} from "bun:test";
import supertest from "supertest";
import type { Express } from "express";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../../../src/application/ports/repositories/doctor.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../../src/application/ports/repositories/user.repository";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";
import { Email } from "../../../../src/domain/value-objects/email";
import { createApp } from "../../../../src/infrastructure/web/http";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import { Crm } from "../../../../src/domain/value-objects/crm";
import { User } from "../../../../src/domain/entities/user";
import { Password } from "../../../../src/domain/value-objects/password";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Doctor Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let readUserRepository: IReadUserRepository;
  let writeUserRepository: IWriteUserRepository;
  let readDoctorRepository: IReadDoctorRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  const adminEmail = "admin@example.com";
  const adminPassword = "AdminPass123!";
  let adminToken: string;

  beforeAll(() => {
    readUserRepository = container.get<IReadUserRepository>(
      SYMBOLS.IReadUserRepository
    );
    writeUserRepository = container.get<IWriteUserRepository>(
      SYMBOLS.IWriteUserRepository
    );
    readDoctorRepository = container.get<IReadDoctorRepository>(
      SYMBOLS.IReadDoctorRepository
    );
    writeDoctorRepository = container.get<IWriteDoctorRepository>(
      SYMBOLS.IWriteDoctorRepository
    );
    app = createApp(container);
    request = supertest(app);
  });

  beforeEach(async () => {
    const adminUser = User.from(
      Email.from(adminEmail),
      await Password.from(adminPassword),
      "ADMIN"
    );
    await writeUserRepository.save(adminUser);
    const response = await request.post("/auth/login").send({
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = response.body.token;
  });

  afterEach(async () => {
    await Promise.all([
      writeDoctorRepository.clear(),
      writeUserRepository.clear(),
    ]);
  });

  test("POST /doctors should return 201 with valid input", async () => {
    const input = {
      name: "John Doe",
      crm: "123456-SP",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request
      .post("/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: expect.stringMatching(UUID7_REGEX),
      doctorId: expect.stringMatching(UUID7_REGEX),
      name: input.name,
      crm: input.crm,
      email: input.email,
      role: "DOCTOR",
    });
    const savedUser = await readUserRepository.findByEmail(
      Email.from(input.email)
    );
    expect(savedUser).not.toBeNull();
    expect(savedUser?.id).toBe(response.body.userId);
    expect(savedUser?.email).toBe(response.body.email);
    expect(savedUser?.role).toBe(response.body.role);
    const savedDoctor = await readDoctorRepository.findByCrm(
      Crm.from(input.crm)
    );
    expect(savedDoctor).not.toBeNull();
    expect(savedDoctor?.id).toBe(response.body.doctorId);
    expect(savedDoctor?.name).toBe(response.body.name);
    expect(savedDoctor?.crm).toBe(response.body.crm);
  });
});
