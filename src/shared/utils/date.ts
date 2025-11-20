export class DateUtils {
  public static isAfter(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateUtils.parse(date1, true);
    const d2 = DateUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() > d2.getTime() : false;
  }

  public static isBefore(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateUtils.parse(date1, true);
    const d2 = DateUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() < d2.getTime() : false;
  }

  public static isMax(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateUtils.parse(date1, true);
    const d2 = DateUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() <= d2.getTime() : false;
  }

  public static isMin(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateUtils.parse(date1, true);
    const d2 = DateUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() >= d2.getTime() : false;
  }

  private static isValid(date: Date | null): date is Date {
    return !!date && date.toString() !== 'Invalid Date';
  }

  public static parse(date?: DateType | null, nullable?: false): Date;
  public static parse(date?: DateType | null, nullable?: boolean): Date | null;
  public static parse(date?: DateType | null, nullable?: boolean): Date | null {
    date = DateUtils.toDate(date);
    if (!DateUtils.isValid(date)) return nullable ? null : DateUtils.today();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private static toDate(date?: DateType | null): Date | null {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  }

  public static today(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /** A string date (without time) in ISO format */
  public static todayString(): string {
    return DateUtils.today().toISOString().split('T')[0] + 'T00:00:00.000Z';
  }

  /** A date as a string (without time) in ISO format */
  public static toString(date?: DateType | null, nullable?: false): string;
  public static toString(date?: DateType | null, nullable?: boolean): string | null;
  public static toString(date?: DateType | null, nullable?: boolean): string | null {
    return DateUtils.parse(date, nullable)?.toISOString().split('T')[0] ?? null;
  }
}

export class DateTimeUtils {
  public static isAfter(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateTimeUtils.parse(date1, true);
    const d2 = DateTimeUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() > d2.getTime() : false;
  }

  public static isBefore(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateTimeUtils.parse(date1, true);
    const d2 = DateTimeUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() < d2.getTime() : false;
  }

  public static isMax(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateTimeUtils.parse(date1, true);
    const d2 = DateTimeUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() <= d2.getTime() : false;
  }

  public static isMin(date1?: DateType | null, date2?: DateType | null): boolean {
    const d1 = DateTimeUtils.parse(date1, true);
    const d2 = DateTimeUtils.parse(date2, true);
    return d1 && d2 ? d1.getTime() >= d2.getTime() : false;
  }

  private static isValid(date: Date | null): date is Date {
    return !!date && date.toString() !== 'Invalid Date';
  }

  public static now(): Date {
    return new Date();
  }

  public static parse(date?: DateType | null, nullable?: false): Date;
  public static parse(date?: DateType | null, nullable?: boolean): Date | null;
  public static parse(date?: DateType | null, nullable?: boolean): Date | null {
    date = DateTimeUtils.toDate(date);
    return DateTimeUtils.isValid(date) ? date : (nullable ? null : DateTimeUtils.now());
  }

  private static toDate(date?: DateType | null): Date | null {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  }

  public static toString(date?: DateType | null, nullable?: false): string;
  public static toString(date?: DateType | null, nullable?: boolean): string | null;
  public static toString(date?: DateType | null, nullable?: boolean): string | null {
    return DateTimeUtils.parse(date, nullable)?.toISOString() ?? null;
  }
}
