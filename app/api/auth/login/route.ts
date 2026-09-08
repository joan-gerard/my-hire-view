import { NextResponse, type NextRequest } from 'next/server';
import { readLimitedJsonBody } from '@/lib/api/read-limited-json-body';
import { bootstrapInitialProfile } from '@/lib/auth/bootstrap-initial-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';
import {
  AUTH_REQUEST_BODY_MAX_BYTES,
  formatLoginZodError,
  GENERIC_LOGIN_ERROR,
  loginBodySchema,
} from '@/lib/validation/auth';

/** 15 login attempts per minute per IP — balances brute-force protection with typo retries. */
const LOGIN_RATE_LIMIT = { limit: 15, windowMs: 60_000 };

/**
 * Server-side login: signs in with Supabase and sets session cookies on the response.
 * Also bootstraps a missing profiles row from Auth user_metadata (safety net when
 * signup insert failed and the email-confirmation callback never ran — C1-009).
 *
 * F1-040: validates body shape; returns generic errors for Auth failures (no
 * email enumeration); malformed JSON → 400; unexpected Auth failures are logged.
 */
export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(request, LOGIN_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const bodyResult = await readLimitedJsonBody(
    request,
    AUTH_REQUEST_BODY_MAX_BYTES,
  );
  if (!bodyResult.ok) {
    if (bodyResult.error === 'too_large') {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 },
      );
    }
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const raw = bodyResult.value;

  const parsed = loginBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatLoginZodError(parsed.error) },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;

  const response = NextResponse.json({ success: true });
  const supabase = createSupabaseRouteClient({ request, response });

  let data;
  let error;
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    data = result.data;
    error = result.error;
  } catch (err) {
    console.error('[auth/login] unexpected Auth API failure:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }

  if (error) {
    // Keep Auth provider details off the client (F1-040 enumeration).
    console.warn('[auth/login] sign-in rejected:', error.message);
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  if (!data.session) {
    console.error('[auth/login] Auth returned success without a session');
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
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
