type AnyObject = Record<RecordKey, unknown>;

interface Array<T> {
  includes<U>(searchElement: U, fromIndex?: number): searchElement is T;
}

type DateType = number | string | Date;

/** Avoid nested Partials */
type FlatPartial<T> = Partial<T extends Partial<infer U> ? U : T>;

interface ObjectConstructor {
  keys<T extends object>(obj: T): (keyof T)[];
}

type RecordKey = string | number | symbol;

type Join<A extends object, B extends object> = Omit<A, keyof B> & B;
