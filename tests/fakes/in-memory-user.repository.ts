import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "@/application/repositories/user.repository";
import type { User } from "@/domain/entities/user";
import type { Email } from "@/domain/value-objects/email";

export class InMemoryUserRepository
  implements IWriteUserRepository, IReadUserRepository
{
  private users: User[] = [];

  public async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email === email.value) || null;
  }

  public async save(user: User): Promise<void> {
    this.users.push(user);
  }

  public clear(): void {
    this.users = [];
  }
}
