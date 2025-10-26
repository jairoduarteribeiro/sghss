import { VALIDATION_MESSAGES } from "@/domain/constants/validation-messages";
import { DomainError } from "@/domain/errors/domain-error";
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

  test.each(["700.000.004-00", "129.841.800-38"])(
    "Should create a Cpf by removing symbols (%s)",
    (formattedCpf) => {
      const unformattedCpf = formattedCpf.replace(/\D/g, "");
      const cpf = new Cpf(formattedCpf);
      expect(cpf.value).toBe(unformattedCpf);
    }
  );

  test.each(["123.456.78900", "123456789-00", "abc.def.ghi-jk"])(
    "Should not create a Cpf if a invalid value (%s) is provided",
    (invalidCpf) => {
      const act = () => new Cpf(invalidCpf);
      expect(act).toThrow(
        new DomainError(VALIDATION_MESSAGES.CPF_INVALID_FORMAT)
      );
    }
  );
});
