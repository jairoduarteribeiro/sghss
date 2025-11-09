import { describe, test, expect } from "bun:test";
import { Name } from "../../../src/domain/value-objects/name";

describe("Name Value Object", () => {
  test("Should create a valid Name", () => {
    const name = Name.from("John Doe");
    expect(name.value).toBe("John Doe");
  });

  test("Should trim and normalize a Name", () => {
    const name = Name.from("   John   Doe   ");
    expect(name.value).toBe("John Doe");
  });

  test.each(["J", "a".repeat(256)])(
    "Should not create a name with invalid length",
    (invalidName) => {
      const act = () => Name.from(invalidName);
      expect(act).toThrowError(
        "Name length must be between 2 and 255 characters"
      );
    }
  );
});
