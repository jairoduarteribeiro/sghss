import { mock } from "bun:test";
import type { IAuthTokenService } from "../../../src/application/ports/services/auth-token-service";
import type { IConferenceLinkGenerator } from "../../../src/application/ports/services/conference-link-generator";
import { Uuid } from "../../../src/domain/value-objects/uuid";

export const createMockConferenceLinkGenerator = (
  overrides?: Partial<IConferenceLinkGenerator>,
): IConferenceLinkGenerator => ({
  generate: mock(() => `https://example.com/meet/${Uuid.generate().value}`),
  ...overrides,
});

export const createMockTokenService = (overrides?: Partial<IAuthTokenService>): IAuthTokenService => ({
  generate: mock(() => "mock.jwt.token"),
  extract: mock(() => null),
  ...overrides,
});
