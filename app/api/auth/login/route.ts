import { NextResponse, type NextRequest } from 'next/server';
import {
  ensureProfileWithNames,
  namesFromUserMetadata,
} from '@/lib/auth/ensure-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

/** 5 login attempts per minute per IP to mitigate brute force. */
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

/**
 * Server-side login: signs in with Supabase and sets session cookies on the response.
 * Also ensures a profiles row exists from Auth user_metadata (safety net when
 * email-confirmation callback could not create one).
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

  if (data.user) {
    const names = namesFromUserMetadata(data.user);
    if (names) {
      const profileResult = await ensureProfileWithNames(
        supabase,
        data.user.id,
        names,
      );
      if (profileResult.error) {
        console.error('Profile ensure after login failed:', profileResult.error);
      }
    }
  }

  return response;
}
