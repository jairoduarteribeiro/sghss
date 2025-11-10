import { describe, test, expect } from "bun:test";
import { Doctor } from "../../../src/domain/entities/doctor";
import { Name } from "../../../src/domain/value-objects/name";
import { Crm } from "../../../src/domain/value-objects/crm";
import { Uuid } from "../../../src/domain/value-objects/uuid";
import { convertToObject } from "typescript";

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
});
