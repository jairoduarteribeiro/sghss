import { injectable } from "inversify";
import type { IConferenceLinkGenerator } from "../../application/ports/services/conference-link-generator";
import type { Uuid } from "../../domain/value-objects/uuid";

@injectable()
export class VidaPlusLinkGeneratorService implements IConferenceLinkGenerator {
  generate(id: Uuid): string {
    return `https://vidaplus.com/meet/${id}`;
  }
}
