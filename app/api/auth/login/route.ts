import { NextResponse, type NextRequest } from 'next/server';
import { bootstrapInitialProfile } from '@/lib/auth/bootstrap-initial-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

/** 15 login attempts per minute per IP — balances brute-force protection with typo retries. */
const LOGIN_RATE_LIMIT = { limit: 15, windowMs: 60_000 };

/**
 * Server-side login: signs in with Supabase and sets session cookies on the response.
 * Also bootstraps a missing profiles row from Auth user_metadata (safety net when
 * signup insert failed and the email-confirmation callback never ran — C1-009).
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, LOGIN_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const body = await request.json();
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });
  const supabase = createSupabaseRouteClient({ request, response });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (!data.session) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }

  const user = data.user ?? data.session.user;
  if (user?.id) {
    try {
      const profileResult = await bootstrapInitialProfile(user);
      if (profileResult.skipped) {
        console.warn(
          'Login: skipped profile bootstrap (missing first/last name in metadata)',
        );
      } else if (profileResult.error) {
        console.error(
          'Login succeeded but profiles bootstrap failed:',
          profileResult.error,
        );
      }
    } catch (err) {
      // Do not fail login on bootstrap throws (e.g. missing service-role env).
      console.error('Login profiles bootstrap threw:', err);
    }
  }

  return response;
}
