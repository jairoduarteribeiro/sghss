/** biome-ignore-all lint/suspicious/noExplicitAny: we don't know the exact shape of the data */
const SECRET_FIELDS = ["password", "passwordHash", "token"];
const CPF_FIELDS = ["cpf"];
const EMAIL_FIELDS = ["email"];

function maskSecret(): string {
  return "***";
}

function maskCpf(value: unknown): string {
  return typeof value !== "string" || value.length < 4
    ? "***"
    : value[0] + "*".repeat(value.length - 3) + value.slice(-2);
}

function maskEmail(value: unknown): string {
  if (typeof value !== "string") return "***";
  const parts = value.split("@");
  if (parts.length !== 2) return "***";
  const [user, domain] = parts;
  return `${user?.[0]}***@${domain}`;
}

export function sanitize(data: any): any {
  try {
    if (data === null || data === undefined || typeof data !== "object") return data;
    const clone: any = Array.isArray(data) ? [] : {};
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (SECRET_FIELDS.includes(key)) {
        clone[key] = maskSecret();
        continue;
      }
      if (CPF_FIELDS.includes(key)) {
        clone[key] = maskCpf(value);
        continue;
      }
      if (EMAIL_FIELDS.includes(key)) {
        clone[key] = maskEmail(value);
        continue;
      }
      clone[key] = typeof value === "object" ? sanitize(value) : value;
    }
    return clone;
  } catch {
    return "***";
  }
}
