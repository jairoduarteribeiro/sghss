export class Uuid {
  private constructor(public readonly value: string) {}

  public static create(): Uuid {
    return new Uuid(Bun.randomUUIDv7());
  }

  public static hydrate(value: string): Uuid {
    return new Uuid(value);
  }
}
