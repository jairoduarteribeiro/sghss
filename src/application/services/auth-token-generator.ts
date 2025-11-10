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
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
  }
}
