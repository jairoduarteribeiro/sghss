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

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Doctor - Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;

  // Repositories
  let readUserRepository: IReadUserRepository;
  let writeUserRepository: IWriteUserRepository;
  let readDoctorRepository: IReadDoctorRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  let authTokenService: IAuthTokenService;

  // Auth tokens
  let adminToken: string;
  let nonAdminToken: string;

  const createUserAndGetToken = async (role: "ADMIN" | "DOCTOR" | "PATIENT") => {
    const email = Email.from(`${role.toLowerCase()}${Date.now()}@example.com`);
    const password = await Password.from("Password123!");
    const user = User.from({ email, password, role });
    await writeUserRepository.save(user);
    const token = authTokenService.generate({ userId: user.id, role: user.role });
    return { user, token };
  };

  beforeAll(async () => {
    readUserRepository = container.get(SYMBOLS.IReadUserRepository);
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    readDoctorRepository = container.get(SYMBOLS.IReadDoctorRepository);
    writeDoctorRepository = container.get(SYMBOLS.IWriteDoctorRepository);
    authTokenService = container.get(SYMBOLS.IAuthTokenService);

    const adminData = await createUserAndGetToken("ADMIN");
    adminToken = adminData.token;
    const nonAdminData = await createUserAndGetToken("PATIENT");
    nonAdminToken = nonAdminData.token;

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
    await writeUserRepository.clear();
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

  test("POST /doctors should return 401 when no auth token is provided", async () => {
    const input = {
      name: "Jane Smith",
      crm: "666666-SP",
      specialty: "Cardiology",
      email: "jane.smith@example.com",
      password: "Password123!",
    };
    const response = await request.post("/doctors").send(input);
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toBe("Authentication token is missing or invalid");
  });

  test("GET /doctors should return a list of all doctors", async () => {
    const doc1User = await createUserAndGetToken("DOCTOR");
    const doc2User = await createUserAndGetToken("DOCTOR");
    const doc1 = Doctor.from({
      name: Name.from("Dr. House"),
      crm: Crm.from("111111-SP"),
      specialty: MedicalSpecialty.from("Diagnostic"),
      userId: Uuid.fromString(doc1User.user.id),
    });
    const doc2 = Doctor.from({
      name: Name.from("Dr. Wilson"),
      crm: Crm.from("222222-SP"),
      specialty: MedicalSpecialty.from("Oncology"),
      userId: Uuid.fromString(doc2User.user.id),
    });
    await writeDoctorRepository.save(doc1);
    await writeDoctorRepository.save(doc2);
    const response = await request.get("/doctors");
    expect(response.status).toBe(HttpStatus.OK);
    const doctors = response.body.doctors;
    expect(doctors).toHaveLength(2);
    expect(doctors[0].id).toBe(doc1.id);
    expect(doctors[0].name).toBe(doc1.name);
    expect(doctors[0].crm).toBe(doc1.crm);
    expect(doctors[0].specialty).toBe(doc1.specialty);
    expect(doctors[1].id).toBe(doc2.id);
    expect(doctors[1].name).toBe(doc2.name);
    expect(doctors[1].crm).toBe(doc2.crm);
    expect(doctors[1].specialty).toBe(doc2.specialty);
  });
});
