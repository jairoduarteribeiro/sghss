import { inject, injectable } from "inversify";
import { User } from "../../domain/entities/user";
import { Email } from "../../domain/value-objects/email";
import { Password } from "../../domain/value-objects/password";
import { SYMBOLS } from "../di/inversify.symbols";
import { ConflictError } from "../errors/conflict.error";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../ports/repositories/user.repository";

type RegisterUserInput = {
  email: string;
  password: string;
  role: string;
};

type RegisterUserOutput = {
  userId: string;
  email: string;
  role: string;
};

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(SYMBOLS.IReadUserRepository)
    private readonly readUserRepository: IReadUserRepository,
    @inject(SYMBOLS.IWriteUserRepository)
    private readonly writeUserRepository: IWriteUserRepository
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.from(input.email);
    if (await this.emailExists(email)) {
      throw new ConflictError("Email already in use");
    }
    const user = User.from(
      email,
      await Password.from(input.password),
      input.role
    );
    await this.writeUserRepository.save(user);
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async emailExists(email: Email): Promise<boolean> {
    const existingUser = await this.readUserRepository.findByEmail(email);
    return existingUser !== null;
  }
}
