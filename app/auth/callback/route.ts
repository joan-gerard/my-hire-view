import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { bootstrapInitialProfile } from '@/lib/auth/bootstrap-initial-profile';
import { safeNextPath } from '@/lib/auth/safe-next-path';
import { getSupabaseEnv } from '@/lib/supabase/env';

type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

/**
 * Exchanges the email confirmation (or magic-link) code for a session and
 * redirects to next (default /admin). Ensures a profiles row exists (idempotent
 * safety net if signup could not insert one before confirmation).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'));
  const redirectTo = new URL(next, requestUrl.origin);
  const response = NextResponse.redirect(redirectTo);

  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Ignore if cookie store is read-only in this context.
        }
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        } catch {
          // Ignore if cookie store is read-only in this context.
        }
        response.cookies.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback exchangeCodeForSession failed:', error.message);
    return NextResponse.redirect(
      new URL('/login?error=confirmation', requestUrl.origin),
    );
  }

  const user = data.user ?? data.session?.user;
  if (user?.id) {
    try {
      const result = await bootstrapInitialProfile(user);
      if (result.skipped) {
        console.warn(
          'Auth callback: skipped profile create (missing first/last name in metadata)',
        );
      } else if (result.error) {
        console.error(
          'Auth callback createInitialProfile failed:',
          result.error,
        );
      }
    } catch (err) {
      console.error('Auth callback profile bootstrap threw:', err);
    }
  }

  return response;
}
