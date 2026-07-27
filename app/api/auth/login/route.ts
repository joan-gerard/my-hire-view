import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

/** 15 login attempts per minute per IP — balances brute-force protection with typo retries. */
const LOGIN_RATE_LIMIT = { limit: 15, windowMs: 60_000 };

/**
 * Server-side login: signs in with Supabase and sets session cookies on the response.
 * Profiles are not created here — first profile PUT creates the row (names seeded
 * from Auth user_metadata on the profile page / new application form).
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

  return response;
}
