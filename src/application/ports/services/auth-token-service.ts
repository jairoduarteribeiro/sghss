export type AuthTokenPayload = {
  userId: string;
  role: string;
};

export interface IAuthTokenService {
  generate(payload: AuthTokenPayload): string;
  extract(token: string): AuthTokenPayload | null;
}
