import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ensureProfileWithNames,
  namesFromUserMetadata,
} from '@/lib/auth/ensure-profile';
import { getSupabaseEnv } from '@/lib/supabase/env';

type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

/**
 * Exchanges the email confirmation (or magic-link) code for a session, then
 * ensures a profiles row exists using first/last name from user_metadata
 * (set at signup when Confirm email is ON and no session was issued yet).
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
        // Persist for this request and for the browser via the redirect response.
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

  const user = data.user;
  if (user) {
    const names = namesFromUserMetadata(user);
    if (names) {
      const profileResult = await ensureProfileWithNames(
        supabase,
        user.id,
        names,
      );
      if (profileResult.error) {
        console.error(
          'Profile create after auth callback failed:',
          profileResult.error,
        );
      }
    } else {
      console.warn(
        'Auth callback: user has no first/last name in user_metadata; skipping profile create',
      );
    }
  }

  return response;
}
