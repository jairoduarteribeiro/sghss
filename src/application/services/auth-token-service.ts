import { injectable } from "inversify";
import jwt from "jsonwebtoken";

type AuthTokenPayload = {
  userId: string;
  role: string;
};

export interface IAuthTokenService {
  generate(payload: AuthTokenPayload): string;
  extract(token: string): AuthTokenPayload | null;
}

@injectable()
export class JwtAuthTokenService implements IAuthTokenService {
  generate(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.getSecret(), { expiresIn: "1h" });
  }

  extract(token: string): AuthTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.getSecret()) as AuthTokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  private getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return secret;
  }
}
