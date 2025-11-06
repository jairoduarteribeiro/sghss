import { injectable } from "inversify";
import jwt from "jsonwebtoken";

type AuthTokenPayload = {
  userId: string;
  role: string;
};

export interface IAuthTokenGenerator {
  generate(payload: AuthTokenPayload): string;
}

@injectable()
export class JwtTokenGenerator implements IAuthTokenGenerator {
  generate(payload: AuthTokenPayload): string {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { expiresIn: "1h" });
  }
}
