import { createApp } from "@/infrastructure/web/http";
import { describe, beforeEach, test, expect, afterEach } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { testContainer } from "@tests/config/inversify.container";
import { InMemoryUserRepository } from "@/infrastructure/persistence/in-memory/in-memory-user.repository";
import { InMemoryPatientRepository } from "@/infrastructure/persistence/in-memory/in-memory-patient.repository";
import { HttpStatus } from "@/infrastructure/web/http-status.constants";
import { SignupUseCase } from "@/application/use-cases/signup.use-case";
import { SYMBOLS } from "@/inversify.symbols";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Auth Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let userRepository: InMemoryUserRepository;
  let patientRepository: InMemoryPatientRepository;

  beforeEach(() => {
    userRepository = testContainer.get<InMemoryUserRepository>(
      InMemoryUserRepository
    );
    patientRepository = testContainer.get<InMemoryPatientRepository>(
      InMemoryPatientRepository
    );
    app = createApp(testContainer);
    request = supertest(app);
  });

  afterEach(() => {
    userRepository.clear();
    patientRepository.clear();
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
    const mockUseCase: Partial<SignupUseCase> = {
      execute: () => {
        throw new Error("Unexpected error");
      },
    };
    testContainer.snapshot();
    (
      await testContainer.rebind<Partial<SignupUseCase>>(SYMBOLS.SignupUseCase)
    ).toConstantValue(mockUseCase);
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
    testContainer.restore();
  });
});
