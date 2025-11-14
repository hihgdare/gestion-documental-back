import { v4 as uuidv4 } from 'uuid';

export class UUID {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid UUID format');
    }
  }

  public static generate(): UUID {
    return new UUID(uuidv4());
  }

  public static from(value: string): UUID {
    return new UUID(value);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: UUID): boolean {
    return this.value === other.value;
  }

  private isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}

export class DateUtils {
  public static now(): Date {
    return new Date();
  }

  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public static isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }

  public static isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }

  public static daysBetween(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public static formatISO(date: Date): string {
    return date.toISOString();
  }
}

export class StringUtils {
  public static isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }

  public static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  public static sanitize(value: string): string {
    return value.trim().replace(/[<>]/g, '');
  }
}