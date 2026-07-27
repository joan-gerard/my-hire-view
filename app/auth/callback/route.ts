import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from '@/lib/supabase/env';

type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

/**
 * Exchanges the email confirmation (or magic-link) code for a session and
 * redirects to next (default /admin). Does not create a profiles row —
 * that happens on first profile PUT.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/admin';
  const redirectTo = new URL(
    next.startsWith('/') ? next : '/admin',
    requestUrl.origin,
  );
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback exchangeCodeForSession failed:', error.message);
    return NextResponse.redirect(
      new URL('/login?error=confirmation', requestUrl.origin),
    );
  }

  return response;
}
