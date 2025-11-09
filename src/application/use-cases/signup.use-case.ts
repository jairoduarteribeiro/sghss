import { inject, injectable } from "inversify";
import { User } from "../../domain/entities/user";
import { Email } from "../../domain/value-objects/email";
import { Password } from "../../domain/value-objects/password";
import { SYMBOLS } from "../../inversify.symbols";
import { ConflictError } from "../errors/conflict.error";
import type {
  IReadUserRepository,
  IWriteUserRepository,
} from "../repositories/user.repository";

type SignupInput = {
  email: string;
  password: string;
  role: string;
};

type SignupOutput = {
  userId: string;
  email: string;
  role: string;
};

@injectable()
export class SignupUseCase {
  constructor(
    @inject(SYMBOLS.IReadUserRepository)
    private readonly readUserRepository: IReadUserRepository,
    @inject(SYMBOLS.IWriteUserRepository)
    private readonly writeUserRepository: IWriteUserRepository
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
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
