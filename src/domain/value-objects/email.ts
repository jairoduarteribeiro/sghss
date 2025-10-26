export class Email {
  constructor(public readonly value: string) {
    this.value = this.normalize(value);
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}
