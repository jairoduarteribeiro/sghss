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
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
  }

  extract(token: string): AuthTokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as AuthTokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
