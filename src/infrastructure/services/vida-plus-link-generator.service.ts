import { injectable } from "inversify";
import type { IConferenceLinkGenerator } from "../../application/ports/services/conference-link-generator";
import { Uuid } from "../../domain/value-objects/uuid";

@injectable()
export class VidaPlusLinkGeneratorService implements IConferenceLinkGenerator {
  generate(): string {
    return `https://vidaplus.com/meet/${Uuid.generate().value}`;
  }
}
