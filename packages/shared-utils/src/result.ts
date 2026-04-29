export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = <E = Error>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } =>
  result.ok === true;

export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
  result.ok === false;

export const mapResult = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
  if (isOk(result)) return { ok: true, value: fn(result.value) };
  return result;
};
