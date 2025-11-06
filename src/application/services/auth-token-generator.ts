import { injectable } from "inversify";

type AuthTokenPayload = {
  userId: string;
  role: string;
};

export interface IAuthTokenGenerator {
  generate(payload: AuthTokenPayload): Promise<string>;
}

@injectable()
export class FakeAuthTokenGenerator implements IAuthTokenGenerator {
  async generate(payload: AuthTokenPayload): Promise<string> {
    return `fake-token-for.${payload.userId}.${payload.role}`;
  }
}
