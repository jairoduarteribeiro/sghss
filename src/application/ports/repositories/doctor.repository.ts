import type { Doctor } from "../../../domain/entities/doctor";
import type { Crm } from "../../../domain/value-objects/crm";

export interface IReadDoctorRepository {
  findByCrm(crm: Crm): Promise<Doctor | null>;
}

export interface IWriteDoctorRepository {
  save(doctor: Doctor): Promise<void>;
  clear(): Promise<void>;
}
