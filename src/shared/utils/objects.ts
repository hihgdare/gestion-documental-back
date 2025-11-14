/** Takes an object and return a new object with the same keys except the specified keys */
export function except<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const k = Array.isArray(keys) ? keys.slice() : [keys];
  const result = { ...obj };
  for (const key of k) {
    delete result[key as keyof T];
  }
  return result;
}

/** Check if the given value is a plain object */
export function isObject(obj: unknown): obj is Record<RecordKey, unknown> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

/** Validate if a value is in an object/enum */
export function isValid<T extends object>(value: unknown, enumType: T): value is T {
  return Object.values(enumType).includes(value as T);
}

export const mapObject = <T extends object, U>(obj: T, mapFn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U> => (
  Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [key]: mapFn(value as T[keyof T], key as keyof T) }), {} as Record<keyof T, U>)
);

/** Takes an object and return a new object with the same keys except the empty values */
export function notEmpty<T extends object>(obj: T): FlatPartial<T> {
  const result = { ...obj };
  for (const key in result) {
    if (!result[key]) {
      delete result[key];
    }
  }
  return result;
}

export function recordReplace<O extends object, K extends keyof O>(obj: O, key: RecordKey, value: unknown) {
  if (key in obj) {
    obj[key as K] = value as O[K];
  }
}
