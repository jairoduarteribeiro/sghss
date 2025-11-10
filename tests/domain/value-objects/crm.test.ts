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
});
