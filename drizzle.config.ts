import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/infrastructure/persistence/config";

export default defineConfig({
  out: "./src/infrastructure/persistence/drizzle/migrations",
  schema: "./src/infrastructure/persistence/drizzle/schema",
  dialect: "postgresql",
  dbCredentials: { url: getDatabaseUrl() },
});
