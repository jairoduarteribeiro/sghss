import { Cpf } from "@/domain/value-objects/cpf";
import { describe, test, expect } from "bun:test";

describe("Cpf value object", () => {
  test.each(["70000000400", "12984180038"])(
    "Should create a Cpf if a valid value (%s) is provided",
    (validCpf) => {
      const cpf = Cpf.from(validCpf);
      expect(cpf.value).toBe(validCpf);
    }
  );

  test.each(["700.000.004-00", "129.841.800-38"])(
    "Should create a Cpf by removing symbols (%s)",
    (formattedCpf) => {
      const unformattedCpf = formattedCpf.replace(/\D/g, "");
      const cpf = Cpf.from(formattedCpf);
      expect(cpf.value).toBe(unformattedCpf);
    }
  );

  test.each(["123.456.78900", "123456789-00", "abc.def.ghi-jk"])(
    "Should not create a Cpf if a invalid value (%s) is provided",
    (invalidCpf) => {
      const act = () => Cpf.from(invalidCpf);
      expect(act).toThrow(new Error("CPF with invalid format"));
    }
  );

  test.each([
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ])(
    "Should not create a Cpf if all digits are the same (%s)",
    (invalidCpf) => {
      const act = () => Cpf.from(invalidCpf);
      expect(act).toThrow(new Error("CPF cannot have all digits the same"));
    }
  );

  test.each(["70000000401", "70000000410", "12984180039", "12984180048"])(
    "Should not create a Cpf if check digits are invalid (%s)",
    (invalidCpf) => {
      const act = () => Cpf.from(invalidCpf);
      expect(act).toThrow(new Error("CPF with invalid check digits"));
    }
  );
});
