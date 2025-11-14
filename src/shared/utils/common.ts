import { v4 as uuidv4 } from 'uuid';
import { mapObject } from './objects';
import { isFunction, isString } from './compare';

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

  public static addDays(date: DateType, days: number): Date {
    const result = DateUtils.parse(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public static isAfter(date1?: DateType | null, date2?: DateType | null): boolean {
    date1 = DateUtils.parse(date1, true);
    date2 = DateUtils.parse(date2, true);
    return date1 && date2 ? date1.getTime() > date2.getTime() : false;
  }

  public static isBefore(date1?: DateType | null, date2?: DateType | null): boolean {
    date1 = DateUtils.parse(date1, true);
    date2 = DateUtils.parse(date2, true);
    return date1 && date2 ? date1.getTime() < date2.getTime() : false;
  }

  public static daysBetween(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public static parse(date: DateType | null | undefined, nullable: true): Date | null;
  public static parse(date?: DateType | null, nullable?: false): Date;
  public static parse(date?: DateType | null, nullable?: boolean): Date | null {
    if (!date) return nullable ? null : DateUtils.now();
    const d = date instanceof Date ? date : new Date(date);
    return d.toString() === 'Invalid Date' ? (nullable ? null : DateUtils.now()) : d;
  }

  public static formatISO(date: DateType, nullable?: boolean): string | null {
    return DateUtils.parse(date, nullable as any)?.toISOString() ?? null;
  }
}

type DefaultParsersKeys = keyof typeof defaultParsers;
type ParserMethod = (value?: unknown) => unknown;
type Parser = ParserMethod | DefaultParsersKeys;

const defaultParsers = Object.freeze({
  date: (value?: DateType) => DateUtils.parse(value),
  dateNullable: (value?: DateType) => DateUtils.parse(value, true),
  uuid: (value?: string) => value ?? uuidv4(),
} as const);

export class EntityUtils {
  /**
   * @param a Main object
   * @param b Object with parameters to assign
   * @param {Record<RecordKey, Parser>} parserList List of parsers (optional)
   */
  static assign<A extends object, B extends Record<keyof A | RecordKey, unknown>, P extends Partial<Record<keyof A, Parser>>>(
    a: A,
    b: B,
    parserList?: P,
  ): A {
    const parserKeys = Object.keys(defaultParsers);
    const parsers = (!parserList ? {} : mapObject(parserList, (parser) => {
      if (isFunction(parser)) return parser;
      return isString(parser) && parserKeys.includes(parser) ? defaultParsers[parser] : undefined;
    })) as Record<keyof P, ParserMethod | undefined>;
    Object.keys(a).forEach(key => {
      type Item = A[keyof A];
      const parser = parsers?.[key];
      if (key in b) {
        Object.assign(a, { [key]: b[key] ?? null });
      }
      if (typeof parser === 'function') {
        a[key] = parser(b[key]) as Item;
      }
    });
    return a;
  }
}

export class StringUtils {
  public static isEmpty(value?: string | null): value is null | undefined | '' {
    return !value?.trim().length;
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
