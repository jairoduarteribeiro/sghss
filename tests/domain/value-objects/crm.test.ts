import { describe, test, expect } from "bun:test";
import { Crm } from "../../../src/domain/value-objects/crm";

describe("Crm value object", () => {
  test.each(["1-MG", "12-SP", "123-RJ", "1234-DF", "12345-BA", "123456-PR"])(
    "Should create a Crm if a valid value (%s) is provided",
    (validCrm) => {
      const crm = Crm.from(validCrm);
      expect(crm.value).toBe(validCrm);
    }
  );

  test.each([
    "-MG",
    "1234567-SP",
    "123.RJ",
    "1234DF",
    "12345-BSB",
    "123456-pr",
  ])("Should not create a Crm with invalid format - %s", (invalidCrm) => {
    const act = () => Crm.from(invalidCrm);
    expect(act).toThrowError("CRM with invalid format");
  });

  test("Should not create a Crm with invalid state", () => {
    const act = () => Crm.from("123456-PT");
    expect(act).toThrowError("CRM with invalid state");
  });
});
