import { User } from "@/domain/entities/user";
import { Email } from "@/domain/value-objects/email";
import { type DbClient } from "@/infrastructure/persistence/drizzle/drizzle-client";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import { users } from "@/infrastructure/persistence/drizzle/schema/users";
import { eq } from "drizzle-orm";
import { Password } from "@/domain/value-objects/password";
import { inject, injectable } from "inversify";
import { SYMBOLS } from "@/inversify.symbols";
import { Uuid } from "@/domain/value-objects/uuid";

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

export class DrizzleWriteUserRepository implements IWriteUserRepository {
  constructor(@inject(SYMBOLS.DatabaseClient) private readonly db: DbClient) {}

  async save(user: User): Promise<void> {
    await this.db.insert(users).values({
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    });
  }
}
