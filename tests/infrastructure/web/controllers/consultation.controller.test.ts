import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import type { Express } from "express";
import supertest from "supertest";
import { SYMBOLS } from "../../../../src/application/di/inversify.symbols";
import type { IWriteAppointmentRepository } from "../../../../src/application/ports/repositories/appointment.repository";
import type { IWriteAvailabilityRepository } from "../../../../src/application/ports/repositories/availability.repository";
import type { IWriteConsultationRepository } from "../../../../src/application/ports/repositories/consultation.repository";
import type { IWriteDoctorRepository } from "../../../../src/application/ports/repositories/doctor.repository";
import type { IWritePatientRepository } from "../../../../src/application/ports/repositories/patient.repository";
import type { IWriteUserRepository } from "../../../../src/application/ports/repositories/user.repository";
import type { IAuthTokenService } from "../../../../src/application/ports/services/auth-token-service";
import { Doctor } from "../../../../src/domain/entities/doctor";
import { Patient } from "../../../../src/domain/entities/patient";
import { User } from "../../../../src/domain/entities/user";
import { Cpf } from "../../../../src/domain/value-objects/cpf";
import { Crm } from "../../../../src/domain/value-objects/crm";
import { Email } from "../../../../src/domain/value-objects/email";
import { MedicalSpecialty } from "../../../../src/domain/value-objects/medical-specialty";
import { Name } from "../../../../src/domain/value-objects/name";
import { Password } from "../../../../src/domain/value-objects/password";
import { Uuid } from "../../../../src/domain/value-objects/uuid";
import { container } from "../../../../src/infrastructure/di/inversify.container";
import type { ExpressApp } from "../../../../src/infrastructure/web/express-app";
import { HttpStatus } from "../../../../src/infrastructure/web/http-status.constants";
import { DateBuilder } from "../../../utils/date-builder";

const UUID7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Consultation - Controller", () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;

  let writeUserRepository: IWriteUserRepository;
  let writeDoctorRepository: IWriteDoctorRepository;
  let writePatientRepository: IWritePatientRepository;
  let writeAvailabilityRepository: IWriteAvailabilityRepository;
  let writeAppointmentRepository: IWriteAppointmentRepository;
  let writeConsultationRepository: IWriteConsultationRepository;
  let authTokenService: IAuthTokenService;

  let doctorToken: string;
  let patientToken: string;
  let doctorId: string;
  let patientId: string;
  let slotId: string;
  let appointmentId: string;

  const createUserAndGetToken = async (role: "ADMIN" | "DOCTOR" | "PATIENT") => {
    const email = Email.from(`${role.toLowerCase()}${Date.now()}@example.com`);
    const password = await Password.from("Password123!");
    const user = User.from({ email, password, role });
    await writeUserRepository.save(user);
    const token = authTokenService.generate({ userId: user.id, role: user.role });
    return { user, token };
  };

  beforeAll(async () => {
    writeUserRepository = container.get(SYMBOLS.IWriteUserRepository);
    writeDoctorRepository = container.get(SYMBOLS.IWriteDoctorRepository);
    writePatientRepository = container.get(SYMBOLS.IWritePatientRepository);
    writeAvailabilityRepository = container.get(SYMBOLS.IWriteAvailabilityRepository);
    writeAppointmentRepository = container.get(SYMBOLS.IWriteAppointmentRepository);
    writeConsultationRepository = container.get(SYMBOLS.IWriteConsultationRepository);
    authTokenService = container.get(SYMBOLS.IAuthTokenService);

    const doctorData = await createUserAndGetToken("DOCTOR");
    doctorToken = doctorData.token;
    const doctor = Doctor.from({
      name: Name.from("Dr. Consultation"),
      crm: Crm.from("999999-SP"),
      specialty: MedicalSpecialty.from("Cardiology"),
      userId: Uuid.fromString(doctorData.user.id),
    });
    await writeDoctorRepository.save(doctor);
    doctorId = doctor.id;

    const patientData = await createUserAndGetToken("PATIENT");
    patientToken = patientData.token;
    const patient = Patient.from({
      name: Name.from("John Patient"),
      cpf: Cpf.from("70000000400"),
      userId: Uuid.fromString(patientData.user.id),
    });
    await writePatientRepository.save(patient);
    patientId = patient.id;

    app = container.get<ExpressApp>(SYMBOLS.HttpApp).build();
    request = supertest(app);
  });

  beforeEach(async () => {
    const tomorrow = DateBuilder.tomorrow();
    const startDateTime = tomorrow.withTime(10, 0).build();
    const endDateTime = tomorrow.withTime(12, 0).build();
    const response = await request.post("/availabilities").set("Authorization", `Bearer ${doctorToken}`).send({
      doctorId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    });
    slotId = response.body.slots[0].slotId;
    const appointmentResponse = await request
      .post("/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        slotId,
        patientId,
        modality: "IN_PERSON",
      });
    appointmentId = appointmentResponse.body.appointmentId;
  });

  afterEach(async () => {
    Promise.all([
      writeConsultationRepository.clear(),
      writeAppointmentRepository.clear(),
      writeAvailabilityRepository.clear(),
    ]);
  });

  afterAll(async () => {
    await writeUserRepository.clear();
  });

  test("POST /consultations should register a consultation successfully", async () => {
    const input = {
      appointmentId,
      notes: "Patient complains about chest pain.",
      diagnosis: "Possible angina.",
      prescription: "Aspirin 100mg daily.",
      referral: "Cardiology specialist exam.",
    };
    const response = await request.post("/consultations").set("Authorization", `Bearer ${doctorToken}`).send(input);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.consultationId).toMatch(UUID7_REGEX);
    expect(response.body.appointmentId).toBe(appointmentId);
    expect(response.body.notes).toBe(input.notes);
    expect(response.body.diagnosis).toBe(input.diagnosis);
    expect(response.body.prescription).toBe(input.prescription);
    expect(response.body.referral).toBe(input.referral);
  });
});
