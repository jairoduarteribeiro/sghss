import type { Doctor } from "../../../domain/entities/doctor";
import type { Crm } from "../../../domain/value-objects/crm";
import type { Uuid } from "../../../domain/value-objects/uuid";

export interface IReadDoctorRepository {
  findById(id: Uuid): Promise<Doctor | null>;
  findByCrm(crm: Crm): Promise<Doctor | null>;
}

export interface IWriteDoctorRepository {
  save(doctor: Doctor): Promise<void>;
  clear(): Promise<void>;
}
