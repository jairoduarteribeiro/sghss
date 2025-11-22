export class DateBuilder {
  private date: Date;

  private constructor(date: Date) {
    this.date = new Date(date);
  }

  static now(): DateBuilder {
    return new DateBuilder(new Date());
  }

  static yesterday(): DateBuilder {
    return DateBuilder.now().minusDays(1);
  }

  static tomorrow(): DateBuilder {
    return DateBuilder.now().plusDays(1);
  }

  static from(date: Date): DateBuilder {
    return new DateBuilder(date);
  }

  plusDays(days: number): DateBuilder {
    this.date.setDate(this.date.getDate() + days);
    return this;
  }

  minusDays(days: number): DateBuilder {
    this.date.setDate(this.date.getDate() - days);
    return this;
  }

  withTime(hours: number, minutes: number, seconds = 0): DateBuilder {
    this.date.setHours(hours, minutes, seconds, 0);
    return this;
  }

  build(): Date {
    return new Date(this.date);
  }
}
