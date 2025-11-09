import { describe, test, expect, afterEach, beforeAll } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { Container } from "inversify";
import type { IUnitOfWork } from "../../../src/application/ports/unit-of-work";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../../src/application/repositories/patient.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../src/application/repositories/user.repository";
import type { LoginUseCase } from "../../../src/application/use-cases/login.use-case";
import { container } from "../../../src/config/inversify.container";
import { Cpf } from "../../../src/domain/value-objects/cpf";
import { Email } from "../../../src/domain/value-objects/email";
import { createApp } from "../../../src/infrastructure/web/http";
import { HttpStatus } from "../../../src/infrastructure/web/http-status.constants";
import { SYMBOLS } from "../../../src/inversify.symbols";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

describe("Auth Controller - Signup", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let readUserRepository: IReadUserRepository;
  let writeUserRepository: IWriteUserRepository;
  let readPatientRepository: IReadPatientRepository;
  let writePatientRepository: IWritePatientRepository;

  beforeAll(() => {
    readUserRepository = container.get<IReadUserRepository>(
      SYMBOLS.IReadUserRepository
    );
    writeUserRepository = container.get<IWriteUserRepository>(
      SYMBOLS.IWriteUserRepository
    );
    readPatientRepository = container.get<IReadPatientRepository>(
      SYMBOLS.IReadPatientRepository
    );
    writePatientRepository = container.get<IWritePatientRepository>(
      SYMBOLS.IWritePatientRepository
    );
    app = createApp(container);
    request = supertest(app);
  });

  afterEach(async () => {
    await Promise.all([
      writeUserRepository.clear(),
      writePatientRepository.clear(),
    ]);
  });

  test("POST /auth/signup should return 201 with valid input", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/auth/signup").send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({
      userId: expect.stringMatching(UUID7_REGEX),
      patientId: expect.stringMatching(UUID7_REGEX),
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      role: "PATIENT",
    });
    const savedUser = await readUserRepository.findByEmail(
      Email.from(input.email)
    );
    expect(savedUser).toBeDefined();
    expect(savedUser?.id).toBe(response.body.userId);
    expect(savedUser?.email).toBe(input.email);
    expect(savedUser?.role).toBe("PATIENT");
    const savedPatient = await readPatientRepository.findByCpf(
      Cpf.from(input.cpf)
    );
    expect(savedPatient).toBeDefined();
    expect(savedPatient?.id).toBe(response.body.patientId);
    expect(savedPatient?.name).toBe(input.name);
    expect(savedPatient?.cpf).toBe(input.cpf);
    expect(savedPatient?.userId).toBe(savedUser?.id);
  });

  test("POST /auth/signup should return 422 with invalid input", async () => {
    const input = {
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/auth/signup").send(input);
    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(response.body.message).toBe("Invalid request data");
  });

  test("POST /auth/signup should return 400 with invalid Cpf", async () => {
    const input = {
      name: "John Doe",
      cpf: "111.111.111-11",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/auth/signup").send(input);
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toBe("CPF cannot have all digits the same");
  });

  test("POST /auth/signup should return 409 when email already exists", async () => {
    const input1 = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    await request.post("/auth/signup").send(input1);
    const input2 = {
      name: "John Smith Doe",
      cpf: "12984180038",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await request.post("/auth/signup").send(input2);
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.body.message).toBe("Email already in use");
  });

  test("POST /auth/signup should return 500 on unexpected errors", async () => {
    const mockUnitOfWork: Partial<IUnitOfWork> = {
      transaction: async (fn: Function) => {
        throw new Error("Unexpected error");
      },
    };
    const testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IUnitOfWork);
    testContainer
      .bind<Partial<IUnitOfWork>>(SYMBOLS.IUnitOfWork)
      .toConstantValue(mockUnitOfWork);
    const mockedApp = createApp(testContainer);
    const mockedRequest = supertest(mockedApp);
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const response = await mockedRequest.post("/auth/signup").send(input);
    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe("Internal server error");
  });
});

describe("Auth Controller - Login", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let writeUserRepository: IWriteUserRepository;

  beforeAll(() => {
    writeUserRepository = container.get<IWriteUserRepository>(
      SYMBOLS.IWriteUserRepository
    );
    app = createApp(container);
    request = supertest(app);
  });

  afterEach(async () => {
    await writeUserRepository.clear();
  });

  test("POST /auth/login should return 200 with valid credentials", async () => {
    const signupInput = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const signupResponse = await request.post("/auth/signup").send(signupInput);
    const loginInput = {
      email: signupInput.email,
      password: signupInput.password,
    };
    const loginResponse = await request.post("/auth/login").send(loginInput);
    expect(loginResponse.status).toBe(HttpStatus.OK);
    expect(loginResponse.body).toEqual({
      userId: signupResponse.body.userId,
      token: expect.stringMatching(JWT_REGEX),
    });
  });

  test("POST /auth/login should return 422 with invalid input", async () => {
    const input = {
      email: "not-an-email",
      password: "Password123!",
    };
    const response = await request.post("/auth/login").send(input);
    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(response.body.message).toBe("Invalid request data");
  });

  test("POST /auth/login should return 401 with non-existing email", async () => {
    const loginInput = {
      email: "non.existing@example.com",
      password: "Password123!",
    };
    const loginResponse = await request.post("/auth/login").send(loginInput);
    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(loginResponse.body.message).toBe("User not found");
  });

  test("POST /auth/login should return 401 with incorrect password", async () => {
    const signupInput = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    await request.post("/auth/signup").send(signupInput);
    const loginInput = {
      email: signupInput.email,
      password: "WrongPassword!",
    };
    const loginResponse = await request.post("/auth/login").send(loginInput);
    expect(loginResponse).toBeDefined();
    expect(loginResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(loginResponse.body.message).toBe("Invalid password");
  });

  test("POST /auth/login should return 500 on unexpected errors", async () => {
    const mockUseCase: Partial<LoginUseCase> = {
      execute: () => {
        throw new Error("Unexpected error");
      },
    };
    const testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.LoginUseCase);
    testContainer
      .bind<Partial<LoginUseCase>>(SYMBOLS.LoginUseCase)
      .toConstantValue(mockUseCase);
    const mockedApp = createApp(testContainer);
    const mockedRequest = supertest(mockedApp);
    const loginInput = {
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const loginResponse = await mockedRequest
      .post("/auth/login")
      .send(loginInput);
    expect(loginResponse.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(loginResponse.body.message).toBe("Internal server error");
  });
});
