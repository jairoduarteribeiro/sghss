import { Container, inject, injectable } from "inversify";
import type { IUnitOfWork } from "../../../../application/ports/unit-of-work";
import { SYMBOLS } from "../../../../inversify.symbols";
import type { DbClient } from "../drizzle-client";

@injectable()
export class DrizzleUnitOfWork implements IUnitOfWork {
  constructor(
    @inject(SYMBOLS.DatabaseClient) private readonly db: DbClient,
    @inject(SYMBOLS.Container) private readonly mainContainer: Container
  ) {}

  async transaction<T>(
    callback: (container: Container) => Promise<T>
  ): Promise<T> {
    return await this.db.transaction(async (tx) => {
      const childContainer = new Container({ parent: this.mainContainer });
      childContainer.unbind(SYMBOLS.DatabaseClient);
      childContainer.bind<DbClient>(SYMBOLS.DatabaseClient).toConstantValue(tx);
      return callback(childContainer);
    });
  }
}
