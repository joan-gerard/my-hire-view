import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createInitialProfile } from '@/lib/auth/create-initial-profile';
import { namesFromUserMetadata } from '@/lib/auth/ensure-profile';
import { publicIdFromUserMetadata } from '@/lib/auth/ensure-public-id';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { generatePublicId } from '@/lib/utils/public-id';

type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];

/** Allow only safe same-origin relative paths (reject `//evil.com` open redirects). */
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('\\')) {
    return '/admin';
  }
  return next;
}

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
    const names = namesFromUserMetadata(user);
    const publicId = publicIdFromUserMetadata(user) ?? generatePublicId();
    if (names) {
      const result = await createInitialProfile({
        userId: user.id,
        first_name: names.first_name,
        last_name: names.last_name,
        public_id: publicId,
      });
      if (result.error) {
        console.error(
          'Auth callback createInitialProfile failed:',
          result.error,
        );
      }
    } else {
      console.error(
        'Auth callback: user has no first/last name in metadata; skipped profile create',
      );
    }
  }

  return response;
}
