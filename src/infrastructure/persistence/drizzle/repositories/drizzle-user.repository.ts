import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../../application/ports/repositories/user.repository";
import { User, type UserRole } from "../../../../domain/entities/user";
import { Email } from "../../../../domain/value-objects/email";
import { Password } from "../../../../domain/value-objects/password";
import { Uuid } from "../../../../domain/value-objects/uuid";
import type { DbClient } from "../drizzle-client";
import { users } from "../schema";

@injectable()
export class DrizzleReadUserRepository implements IReadUserRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const [result] = await this.db.select().from(users).where(eq(users.email, email.value));
    return result
      ? User.restore({
          id: Uuid.fromString(result.id),
          email: Email.from(result.email),
          password: Password.fromHash(result.passwordHash),
          role: result.role as UserRole,
        })
      : null;
  }
}

@injectable()
export class DrizzleWriteUserRepository implements IWriteUserRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(user: User): Promise<void> {
    await this.db.insert(users).values({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    });
  }

  async deleteByEmail(email: Email): Promise<void> {
    await this.db.delete(users).where(eq(users.email, email.value));
  }

  async clear(): Promise<void> {
    await this.db.delete(users);
  }
}
