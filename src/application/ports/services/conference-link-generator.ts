import type { Uuid } from "../../../domain/value-objects/uuid";

export interface IConferenceLinkGenerator {
  generate(id: Uuid): string;
}
