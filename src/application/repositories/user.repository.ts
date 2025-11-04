import type { User } from "@/domain/entities/user";
import type { Email } from "@/domain/value-objects/email";

export interface IReadUserRepository {
  findByEmail(email: Email): Promise<User | null>;
}

export interface IWriteUserRepository {
  save(user: User): Promise<void>;
}
