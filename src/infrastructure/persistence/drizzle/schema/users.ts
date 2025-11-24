import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { USER_ROLES } from "../../../../domain/entities/user";
import { MAX_EMAIL_SIZE } from "../../../../domain/value-objects/email";

export const userRolesEnum = pgEnum("user_role", USER_ROLES);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: MAX_EMAIL_SIZE }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRolesEnum("role").notNull().default("PATIENT"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
});
