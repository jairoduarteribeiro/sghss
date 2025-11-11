import { describe, expect, test } from "bun:test";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Crm } from "../../../src/domain/value-objects/crm";
import { Name } from "../../../src/domain/value-objects/name";
import { Uuid } from "../../../src/domain/value-objects/uuid";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("Doctor entity", () => {
  test("Should create a Doctor successfully", () => {
    const name = Name.from("John Doe");
    const crm = Crm.from("123456-SP");
    const userId = Uuid.generate();
    const doctor = Doctor.from(name, crm, userId);
    expect(doctor.id).toMatch(UUID7_REGEX);
    expect(doctor.name).toBe(name.value);
    expect(doctor.crm).toBe(crm.value);
    expect(doctor.userId).toBe(userId.value);
  });

  test("Should restore a Doctor successfully", () => {
    const id = Uuid.generate();
    const name = Name.from("John Doe");
    const crm = Crm.from("123456-SP");
    const userId = Uuid.generate();
    const doctor = Doctor.restore(id, name, crm, userId);
    expect(doctor.id).toBe(id.value);
    expect(doctor.name).toBe(name.value);
    expect(doctor.crm).toBe(crm.value);
    expect(doctor.userId).toBe(userId.value);
  });
});
