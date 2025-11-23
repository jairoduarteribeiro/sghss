import type { Doctor } from "../../../domain/entities/doctor";
import type { Crm } from "../../../domain/value-objects/crm";
import type { Uuid } from "../../../domain/value-objects/uuid";

export type DoctorFilter = {
  name?: string;
  specialty?: string;
};

export interface IReadDoctorRepository {
  findById(id: Uuid): Promise<Doctor | null>;
  findByCrm(crm: Crm): Promise<Doctor | null>;
  findByUserId(userId: Uuid): Promise<Doctor | null>;
  findAll(filter: DoctorFilter): Promise<Doctor[]>;
}

export interface IWriteDoctorRepository {
  save(doctor: Doctor): Promise<void>;
  clear(): Promise<void>;
}
