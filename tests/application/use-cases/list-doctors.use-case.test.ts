import { afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { Container } from "inversify";
import { SYMBOLS } from "../../../src/application/di/inversify.symbols";
import type {
  DoctorFilter,
  IReadDoctorRepository,
} from "../../../src/application/ports/repositories/doctor.repository";
import type { ListDoctorsUseCase } from "../../../src/application/use-cases/list-doctors.use-case";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Crm } from "../../../src/domain/value-objects/crm";
import { MedicalSpecialty } from "../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { container } from "../../../src/infrastructure/di/inversify.container";

describe("List Doctors - Use Case", () => {
  let testContainer: Container;
  let useCase: ListDoctorsUseCase;

  const doctor1 = Doctor.from(
    Name.from("Gregory House"),
    Crm.from("111111-RJ"),
    MedicalSpecialty.from("Diagnostic Medicine"),
    Uuid.generate(),
  );
  const doctor2 = Doctor.from(
    Name.from("James Wilson"),
    Crm.from("222222-RJ"),
    MedicalSpecialty.from("Oncology"),
    Uuid.generate(),
  );
  const doctor3 = Doctor.from(
    Name.from("Lisa Cuddy"),
    Crm.from("333333-RJ"),
    MedicalSpecialty.from("Endocrinology"),
    Uuid.generate(),
  );
  const allDoctors = [doctor1, doctor2, doctor3];

  const mockReadDoctorRepository: IReadDoctorRepository = {
    findById: mock(async () => null),
    findByCrm: mock(async () => null),
    findAll: mock(async (filters: DoctorFilter) => {
      return allDoctors.filter((doc) => {
        let matches = true;
        if (filters.specialty) {
          matches = matches && doc.specialty.toLowerCase().includes(filters.specialty.toLowerCase());
        }
        if (filters.name) {
          matches = matches && doc.name.toLowerCase().includes(filters.name.toLowerCase());
        }
        return matches;
      });
    }),
  };

  beforeAll(() => {
    testContainer = new Container({ parent: container });
    testContainer.unbind(SYMBOLS.IReadDoctorRepository);
    testContainer.bind(SYMBOLS.IReadDoctorRepository).toConstantValue(mockReadDoctorRepository);
    useCase = testContainer.get<ListDoctorsUseCase>(SYMBOLS.ListDoctorsUseCase);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  test("Should list all doctors when no filter is provided", async () => {
    const output = await useCase.execute();
    expect(output.doctors).toHaveLength(3);
    expect(output.doctors[0]).toEqual({
      id: doctor1.id,
      name: doctor1.name,
      crm: doctor1.crm,
      specialty: doctor1.specialty,
    });
    expect(output.doctors[1]).toEqual({
      id: doctor2.id,
      name: doctor2.name,
      crm: doctor2.crm,
      specialty: doctor2.specialty,
    });
    expect(output.doctors[2]).toEqual({
      id: doctor3.id,
      name: doctor3.name,
      crm: doctor3.crm,
      specialty: doctor3.specialty,
    });
  });

  test("Should filter doctors by specialty", async () => {
    const output = await useCase.execute({ specialty: "Oncology" });
    expect(output.doctors).toHaveLength(1);
    expect(output.doctors[0]).toEqual({
      id: doctor2.id,
      name: doctor2.name,
      crm: doctor2.crm,
      specialty: doctor2.specialty,
    });
  });

  test("Should filter doctors by name", async () => {
    const output = await useCase.execute({ name: "House" });
    expect(output.doctors).toHaveLength(1);
    expect(output.doctors[0]).toEqual({
      id: doctor1.id,
      name: doctor1.name,
      crm: doctor1.crm,
      specialty: doctor1.specialty,
    });
  });

  test("Should filter by BOTH name AND specialty", async () => {
    const output = await useCase.execute({ name: "Lisa", specialty: "Endocrinology" });
    expect(output.doctors).toHaveLength(1);
    expect(output.doctors[0]).toEqual({
      id: doctor3.id,
      name: doctor3.name,
      crm: doctor3.crm,
      specialty: doctor3.specialty,
    });
  });

  test("Should return empty list if criteria do not match (AND logic)", async () => {
    const output = await useCase.execute({ name: "House", specialty: "Oncology" });
    expect(output.doctors).toHaveLength(0);
  });
});
