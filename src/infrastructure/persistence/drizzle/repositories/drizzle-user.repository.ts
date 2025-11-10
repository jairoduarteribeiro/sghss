import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../../../../application/ports/repositories/user.repository";
import { User } from "../../../../domain/entities/user";
import { Email } from "../../../../domain/value-objects/email";
import { Password } from "../../../../domain/value-objects/password";
import { Uuid } from "../../../../domain/value-objects/uuid";
import { SYMBOLS } from "../../../../application/di/inversify.symbols";
import type { DbClient } from "../drizzle-client";
import { users } from "../schema";

@injectable()
export class DrizzleReadUserRepository implements IReadUserRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.value));
    return result
      ? User.restore(
          Uuid.fromString(result.id),
          Email.from(result.email),
          Password.fromHash(result.passwordHash),
          result.role
        )
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

  async clear(): Promise<void> {
    await this.db.delete(users);
  }
}
