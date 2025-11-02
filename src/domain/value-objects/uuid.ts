export class Uuid {
  private constructor(public readonly value: string) {}

  public static generate(): Uuid {
    return new Uuid(Bun.randomUUIDv7());
  }

  public static fromString(value: string): Uuid {
    return new Uuid(value);
  }
}
