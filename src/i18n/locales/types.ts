/**
 * The Spanish locale is the source of truth. en/ and pt/ are annotated with
 * this type over `typeof es`, so a missing or extra key in either fails
 * `tsc` -- translation parity is a compile-time check, not a convention.
 */
export type DeepStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]>;
};
