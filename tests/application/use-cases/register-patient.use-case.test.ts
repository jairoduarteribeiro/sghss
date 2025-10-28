import type { PatientRepository } from "@/application/ports/patient-repository.port";
import { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import { Patient } from "@/domain/entities/patient";
import type { PatientID } from "@/domain/types/id";
import { describe, test, expect, spyOn, beforeEach } from "bun:test";

class FakePatientRepository implements PatientRepository {
  private patients: Patient[] = [];

  async save(patient: Patient): Promise<void> {
    this.patients.push(patient);
  }

  async findById(id: PatientID): Promise<Patient | null> {
    return this.patients.find((p) => p.id === id) || null;
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
});
