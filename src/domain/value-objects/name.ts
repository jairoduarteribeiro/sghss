export class Name {
  private constructor(public readonly value: string) {}

  static from(name: string): Name {
    const normalizedName = this.normalize(name);
    return new Name(normalizedName);
  }

  private static normalize(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }
}
