import { APPLICATION_ERROR_MESSAGES } from "@/application/constants/application-error-messages";
import { ApplicationError } from "@/application/errors/application-error";
import type { PatientRepository } from "@/application/ports/patient-repository.port";
import { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import { Patient } from "@/domain/entities/patient";
import type { PatientID } from "@/domain/types/id";
import { Cpf } from "@/domain/value-objects/cpf";
import { Email } from "@/domain/value-objects/email";
import { Password } from "@/domain/value-objects/password";
import { describe, test, expect, spyOn, beforeEach } from "bun:test";

class FakePatientRepository implements PatientRepository {
  private patients: Patient[] = [];

  async save(patient: Patient): Promise<void> {
    this.patients.push(patient);
  }

  async findById(id: PatientID): Promise<Patient | null> {
    return this.patients.find((p) => p.id === id) || null;
  }

  async findByCpf(cpf: Cpf): Promise<Patient | null> {
    return this.patients.find((p) => p.cpf.value === cpf.value) || null;
  }

  async findByEmail(email: Email): Promise<Patient | null> {
    return this.patients.find((p) => p.email.value === email.value) || null;
  }
}

describe("RegisterPatientUseCase", () => {
  let useCase: RegisterPatientUseCase;
  let fakeRepo: FakePatientRepository;

  beforeEach(() => {
    fakeRepo = new FakePatientRepository();
    useCase = new RegisterPatientUseCase(fakeRepo);
  });

  test("Should successfully register a new patient", async () => {
    const input = {
      name: "John Doe",
      email: "john.doe@example.com",
      cpf: "70000000400",
      password: "Password123!",
    };
    const saveSpy = spyOn(fakeRepo, "save");
    const output = await useCase.execute(input);
    const savedPatient = await fakeRepo.findById(output.id as PatientID);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(savedPatient?.id as string).toBe(output.id);
    expect(savedPatient?.name).toBe(input.name);
    expect(savedPatient?.cpf.value).toBe(input.cpf);
    expect(savedPatient?.email.value).toBe(input.email);
  });

  test("Should throw an error if email is already in use", async () => {
    const existingPatient = Patient.create({
      name: "Existing User",
      cpf: new Cpf("70000000400"),
      email: new Email("test@example.com"),
      password: await Password.create("Password123!"),
    });
    await fakeRepo.save(existingPatient);
    const input = {
      name: "New User",
      email: "test@example.com",
      cpf: "12984180038",
      password: "Password456!",
    };
    const act = useCase.execute(input);
    expect(act).rejects.toThrow(
      new ApplicationError(APPLICATION_ERROR_MESSAGES.EMAIL_ALREADY_IN_USE)
    );
  });

  test("Should throw an error if CPF is already in use", async () => {
    const existingPatient = await Patient.create({
      name: "Existing User",
      cpf: new Cpf("70000000400"),
      email: new Email("unique.email@example.com"),
      password: await Password.create("Password123!"),
    });
    await fakeRepo.save(existingPatient);
    const input = {
      name: "New User",
      cpf: "70000000400",
      email: "new.user@example.com",
      password: "Password456!",
    };
    const act = useCase.execute(input);
    expect(act).rejects.toThrow(
      new ApplicationError(APPLICATION_ERROR_MESSAGES.CPF_ALREADY_IN_USE)
    );
  });
});
