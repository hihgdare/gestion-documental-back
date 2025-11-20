/** Takes a value or an array and return an array */
export const toArray = <T>(array: T | readonly T[]): T[] => Array.isArray(array) ? array as T[] : [array as T];

/** Merge two arrays removing duplicates. */
export const unique = <A>(array: A[]): A[] => [...new Set(array)];
