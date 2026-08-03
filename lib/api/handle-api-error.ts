import { NextResponse } from 'next/server';

export type HandleApiErrorOptions = {
  /** Client-facing message. Never include stack traces or internal details. */
  message?: string;
  /** HTTP status. Defaults to 500. */
  status?: number;
};

/**
 * Logs an unexpected API error server-side and returns a generic JSON error
 * response. Use in route `catch` blocks so failures are observable without
 * leaking internals to clients.
 *
 * Prefer separating auth (`requireAuth`) into its own try/catch so auth
 * failures stay **401** and are not logged as unexpected errors.
 */
export function handleApiError(
  context: string,
  error: unknown,
  options: HandleApiErrorOptions = {},
): NextResponse {
  console.error(context, error);
  return NextResponse.json(
    { error: options.message ?? 'Internal server error' },
    { status: options.status ?? 500 },
  );
}
