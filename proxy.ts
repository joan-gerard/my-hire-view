/**
 * Next.js 16+ network proxy entry (replaces the deprecated `middleware.ts` convention).
 *
 * Next only auto-loads this root file when it exports a named `proxy` function.
 * Do **not** add a root `middleware.ts` — that convention is deprecated and can
 * confuse which entry refreshes the session / guards `/admin`.
 *
 * Session logic lives in `lib/supabase/middleware.ts` (`updateSession`); this file
 * is only the framework hook + matcher.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * @see F26-060
 */
import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
