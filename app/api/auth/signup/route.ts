import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

/** 5 signup attempts per minute per IP to mitigate abuse. */
const SIGNUP_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

/**
 * Server-side signup: creates a user and sets session cookies on the response
 * when email confirmation is not required.
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, SIGNUP_RATE_LIMIT);
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

  const response = NextResponse.json({ success: true, requiresConfirmation: false });
  const supabase = createSupabaseRouteClient({ request, response });
  const origin = request.nextUrl.origin;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.session) {
    return NextResponse.json({ success: true, requiresConfirmation: true });
  }

  return response;
}
