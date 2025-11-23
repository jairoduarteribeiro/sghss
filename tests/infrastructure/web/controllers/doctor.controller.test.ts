import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../../../src/application/ports/repositories/doctor.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../../src/application/ports/repositories/user.repository";
import { User } from "../../../../src/domain/entities/user";
import { Crm } from "../../../../src/domain/value-objects/crm";
import { Email } from "../../../../src/domain/value-objects/email";
import { Password } from "../../../../src/domain/value-objects/password";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import type { ExpressApp } from "../../../../src/infrastructure/web/express-app";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Doctor - Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let readUserRepository: IReadUserRepository;
  let writeUserRepository: IWriteUserRepository;
  let readDoctorRepository: IReadDoctorRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  let adminToken: string;
  let nonAdminToken: string;

  beforeAll(() => {
    readUserRepository = container.get(SYMBOLS.IReadUserRepository);
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    readDoctorRepository = container.get(SYMBOLS.IReadDoctorRepository);
    writeDoctorRepository = container.get(SYMBOLS.IWriteDoctorRepository);
    app = container.get<ExpressApp>(SYMBOLS.HttpApp).build();
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
    await Promise.all([writeDoctorRepository.clear(), writeUserRepository.clear()]);
  });

  test("POST /doctors should return 201 with valid input", async () => {
    const input = {
      name: "John Doe",
      crm: "123456-SP",
      specialty: "Cardiology",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/doctors").set("Authorization", `Bearer ${adminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: expect.stringMatching(UUID7_REGEX),
      doctorId: expect.stringMatching(UUID7_REGEX),
      name: input.name,
      crm: input.crm,
      specialty: "Cardiology",
      email: input.email,
      role: "DOCTOR",
    });
    const savedUser = await readUserRepository.findByEmail(Email.from(input.email));
    expect(savedUser).not.toBeNull();
    expect(savedUser?.id).toBe(response.body.userId);
    expect(savedUser?.email).toBe(response.body.email);
    expect(savedUser?.role).toBe(response.body.role);
    const savedDoctor = await readDoctorRepository.findByCrm(Crm.from(input.crm));
    expect(savedDoctor).not.toBeNull();
    expect(savedDoctor?.id).toBe(response.body.doctorId);
    expect(savedDoctor?.name).toBe(response.body.name);
    expect(savedDoctor?.crm).toBe(response.body.crm);
    expect(savedDoctor?.specialty).toBe(response.body.specialty);
  });

  test("POST /doctors should return 403 when non-admin user tries to register a doctor", async () => {
    const input = {
      name: "Jane Doe",
      crm: "654321-SP",
      specialty: "Cardiology",
      email: "jane.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/doctors").set("Authorization", `Bearer ${nonAdminToken}`).send(input);
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toBe("Only admin users can access this resource");
  });
});
