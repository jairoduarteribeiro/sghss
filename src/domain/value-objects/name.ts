export class Name {
  private constructor(public readonly value: string) {}

  static from(value: string): Name {
    return new Name(value);
  }
}
