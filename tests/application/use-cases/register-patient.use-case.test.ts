import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "@/application/repositories/patient.repository";
import { RegisterPatientUseCase } from "@/application/use-cases/register-patient.use-case";
import type { Patient } from "@/domain/entities/patient";
import { Email } from "@/domain/value-objects/email";
import { describe, test, expect, beforeEach } from "bun:test";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

class InMemoryPatientRepository
  implements IReadPatientRepository, IWritePatientRepository
{
  private patients: Patient[] = [];

  public async findByEmail(email: Email): Promise<Patient | null> {
    return (
      this.patients.find((patient) => patient.email === email.value) || null
    );
  }

  public async save(patient: Patient): Promise<void> {
    this.patients.push(patient);
  }
}

describe("RegisterPatient Use Case", () => {
  let patientRepository: InMemoryPatientRepository;
  let useCase: RegisterPatientUseCase;

  beforeEach(() => {
    patientRepository = new InMemoryPatientRepository();
    useCase = new RegisterPatientUseCase(patientRepository);
  });

  test("Should register a new patient successfully", async () => {
    const input = {
      name: "John Doe",
      cpf: "70000000400",
      email: "john.doe@example.com",
      password: "Password123!",
    };
    const output = await useCase.execute(input);
    expect(output).toBeDefined();
    expect(output.id).toMatch(UUID7_REGEX);
    expect(output.name).toBe(input.name);
    expect(output.email).toBe(input.email);
    expect(output.cpf).toBe(input.cpf);
    const savedPatient = await patientRepository.findByEmail(
      Email.from(input.email)
    );
    expect(savedPatient).toBeDefined();
    expect(savedPatient?.id).toBe(output.id);
    expect(savedPatient?.name).toBe(output.name);
    expect(savedPatient?.cpf).toBe(output.cpf);
    expect(savedPatient?.email).toBe(output.email);
  });
});
