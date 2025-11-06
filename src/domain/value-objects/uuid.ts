export class Uuid {
  private constructor(readonly value: string) {}

  static generate(): Uuid {
    return new Uuid(Bun.randomUUIDv7());
  }

  static fromString(value: string): Uuid {
    return new Uuid(value);
  }
}
