import { Name } from "@/domain/value-objects/name";
import { describe, test, expect } from "bun:test";

describe("Name Value Object", () => {
  test("Should create a valid Name", () => {
    const name = Name.from("John Doe");
    expect(name.value).toBe("John Doe");
  });
});
