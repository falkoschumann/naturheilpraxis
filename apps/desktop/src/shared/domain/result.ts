// Copyright (c) 2026 Falko Schumann. MIT license.

export type Result<T, E> =
  Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: E }>;

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const fail = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Why a consistency boundary rejects a command. The message tells the user what
// went wrong and how to fix it. The invariant is set when the rejection follows
// from an invariant of the model.
export type Rejection = Readonly<{
  invariant?: string;
  message: string;
}>;
