/** biome-ignore-all lint/suspicious/noExplicitAny: we don't know the exact shape of the data */
const FULL_MASK_FIELDS = ["password", "passwordHash", "token"];
const PARTIAL_MASK_FIELDS = ["cpf", "email"];

function partialMask(value: string): string {
  if (!value) return value;
  if (value.includes("@")) {
    const [user, domain] = value.split("@");
    return `${user?.[0]}***@${domain}`;
  }
  return value[0] + "*".repeat(value.length - 3) + value.slice(-2);
}

export function sanitize(data: any): any {
  if (!data || typeof data !== "object") return data;
  const clone: any = Array.isArray(data) ? [] : {};
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (FULL_MASK_FIELDS.includes(key)) {
      clone[key] = "***";
      continue;
    }
    if (PARTIAL_MASK_FIELDS.includes(key) && typeof value === "string") {
      clone[key] = partialMask(value);
      continue;
    }
    clone[key] = typeof value === "object" ? sanitize(value) : value;
  }
  return clone;
}
