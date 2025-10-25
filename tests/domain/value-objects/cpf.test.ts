import { Cpf } from "@/domain/value-objects/cpf";
import { describe, test, expect } from "bun:test";

describe("Cpf value object", () => {
  test.each(["70000000400", "12984180038"])(
    "Should create a Cpf if a valid value (%s) is provided",
    (validCpf) => {
      const cpf = new Cpf(validCpf);
      expect(cpf.value).toBe(validCpf);
    }
  );
});
