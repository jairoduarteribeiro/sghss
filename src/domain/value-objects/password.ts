export class Password {
  private constructor(public readonly hash: string) {}

  public static async create(plainText: string): Promise<Password> {
    const hash = await Bun.password.hash(plainText);
    return new Password(hash);
  }

  public static hydrate(hash: string): Password {
    return new Password(hash);
  }

  public async verify(plainText: string): Promise<boolean> {
    return await Bun.password.verify(plainText, this.hash);
  }
}
