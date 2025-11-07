import { inject, injectable } from "inversify";
import type { IReadUserRepository } from "@/application/repositories/user.repository";
import { SYMBOLS } from "@/inversify.symbols";
import type { IAuthTokenGenerator } from "@/application/services/auth-token-generator";
import { Email } from "@/domain/value-objects/email";
import { InvalidCredentialsError } from "@/application/errors/invalid-credentials.error";

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
