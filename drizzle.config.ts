import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/infrastructure/persistence/drizzle/migrations",
  schema: "./src/infrastructure/persistence/drizzle/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
