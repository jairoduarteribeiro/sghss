export function getDatabaseUrl(): string {
  const database = process.env.POSTGRES_DB;
  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  if (!database || !username || !password || !host || !port)
    throw new Error("Database configuration environment variables are not set properly");
  return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
}
