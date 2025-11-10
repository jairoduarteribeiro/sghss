import { inject, injectable } from "inversify";
import { Email } from "../../domain/value-objects/email";
import { SYMBOLS } from "../di/inversify.symbols";
import { InvalidCredentialsError } from "../errors/invalid-credentials.error";
import type { IReadUserRepository } from "../ports/repositories/user.repository";
import type { IAuthTokenGenerator } from "../services/auth-token-generator";

type LoginInput = {
  email: string;
  password: string;
};

type LoginOutput = {
  userId: string;
  token: string;
};

@injectable()
export class LoginUseCase {
  constructor(
    @inject(SYMBOLS.IReadUserRepository)
    private readonly readUserRepository: IReadUserRepository,
    @inject(SYMBOLS.IAuthTokenGenerator)
    private readonly tokenGenerator: IAuthTokenGenerator
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = Email.from(input.email);
    const user = await this.readUserRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError("User not found");
    }
    const isPasswordValid = await user.verifyPassword(input.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError("Invalid password");
    }
    const token = this.tokenGenerator.generate({
      userId: user.id,
      role: user.role,
    });
    return {
      userId: user.id,
      token,
    };
  }
}
