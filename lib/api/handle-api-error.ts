import { NextResponse } from 'next/server';

export type HandleApiErrorOptions = {
  /** Client-facing message. Never include stack traces or internal details. */
  message?: string;
  /** HTTP status. Defaults to 500. */
  status?: number;
  /**
   * Server-only fields for ops logs (e.g. publicId, slug, PostgREST code).
   * Never included in the JSON response.
   */
  meta?: Record<string, unknown>;
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
  if (options.meta !== undefined) {
    console.error(context, error, options.meta);
  } else {
    console.error(context, error);
  }
  return NextResponse.json(
    { error: options.message ?? 'Internal server error' },
    { status: options.status ?? 500 },
  );
}
