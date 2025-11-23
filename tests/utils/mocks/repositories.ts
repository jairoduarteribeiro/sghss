import { mock } from "bun:test";
import type {
  IReadAppointmentRepository,
  IWriteAppointmentRepository,
} from "../../../src/application/ports/repositories/appointment.repository";
import type {
  IReadAvailabilityRepository,
  IWriteAvailabilityRepository,
} from "../../../src/application/ports/repositories/availability.repository";
import type {
  IReadConsultationRepository,
  IWriteConsultationRepository,
} from "../../../src/application/ports/repositories/consultation.repository";
import type {
  IReadDoctorRepository,
  IWriteDoctorRepository,
} from "../../../src/application/ports/repositories/doctor.repository";
import type {
  IReadPatientRepository,
  IWritePatientRepository,
} from "../../../src/application/ports/repositories/patient.repository";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../src/application/ports/repositories/user.repository";

// Appointment Repository Mocks
export const createMockReadAppointmentRepository = (
  overrides?: Partial<IReadAppointmentRepository>,
): IReadAppointmentRepository => ({
  findById: mock(async () => null),
  findByPatientId: mock(async () => []),
  findByDoctorId: mock(async () => []),
  findByPatientIdWithDetails: mock(async () => []),
  ...overrides,
});

export const createMockWriteAppointmentRepository = (
  overrides?: Partial<IWriteAppointmentRepository>,
): IWriteAppointmentRepository => ({
  save: mock(async () => {}),
  update: mock(async () => {}),
  clear: mock(async () => {}),
  ...overrides,
});

// Availability Repository Mocks
export const createMockReadAvailabilityRepository = (
  overrides?: Partial<IReadAvailabilityRepository>,
): IReadAvailabilityRepository => ({
  findByDoctorId: mock(async () => []),
  findBySlotId: mock(async () => null),
  ...overrides,
});

export const createMockWriteAvailabilityRepository = (
  overrides?: Partial<IWriteAvailabilityRepository>,
): IWriteAvailabilityRepository => ({
  save: mock(async () => {}),
  update: mock(async () => {}),
  clear: mock(async () => {}),
  ...overrides,
});

// Consultation Repository Mocks
export const createMockReadConsultationRepository = (
  overrides?: Partial<IReadConsultationRepository>,
): IReadConsultationRepository => ({
  findByAppointmentId: mock(async () => null),
  findAllByPatientId: mock(async () => []),
  ...overrides,
});

export const createMockWriteConsultationRepository = (
  overrides?: Partial<IWriteConsultationRepository>,
): IWriteConsultationRepository => ({
  save: mock(async () => {}),
  update: mock(async () => {}),
  clear: mock(async () => {}),
  ...overrides,
});

// Doctor Repository Mocks
export const createMockReadDoctorRepository = (overrides?: Partial<IReadDoctorRepository>): IReadDoctorRepository => ({
  findById: mock(async () => null),
  findByCrm: mock(async () => null),
  findAll: mock(async () => []),
  ...overrides,
});

export const createMockWriteDoctorRepository = (
  overrides?: Partial<IWriteDoctorRepository>,
): IWriteDoctorRepository => ({
  save: mock(async () => {}),
  clear: mock(async () => {}),
  ...overrides,
});

// Patient Repository Mocks
export const createMockReadPatientRepository = (
  overrides?: Partial<IReadPatientRepository>,
): IReadPatientRepository => ({
  findById: mock(async () => null),
  findByCpf: mock(async () => null),
  ...overrides,
});

export const createMockWritePatientRepository = (
  overrides?: Partial<IWritePatientRepository>,
): IWritePatientRepository => ({
  save: mock(async () => {}),
  clear: mock(async () => {}),
  ...overrides,
});

// User Repository Mocks
export const createMockReadUserRepository = (overrides?: Partial<IReadUserRepository>): IReadUserRepository => ({
  findByEmail: mock(async () => null),
  ...overrides,
});

export const createMockWriteUserRepository = (overrides?: Partial<IWriteUserRepository>): IWriteUserRepository => ({
  save: mock(async () => {}),
  deleteByEmail: mock(async () => {}),
  clear: mock(async () => {}),
  ...overrides,
});
