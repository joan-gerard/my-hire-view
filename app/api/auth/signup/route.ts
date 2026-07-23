import { NextResponse, type NextRequest } from 'next/server';
import { ensureProfileWithNames } from '@/lib/auth/ensure-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import {
  copyResponseCookies,
  createSupabaseRouteClient,
} from '@/lib/supabase/route-client';

/** 5 signup attempts per minute per IP to mitigate abuse. */
const SIGNUP_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

const MIN_PASSWORD_LENGTH = 6;

/**
 * Server-side signup: creates a user, stores first/last name in user_metadata,
 * creates a profiles row when a session is issued immediately, and sets session
 * cookies on the response when email confirmation is not required.
 *
 * When confirmation is required, PKCE cookies written during signUp must still
 * be returned so /auth/callback can exchange the email link code later.
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, SIGNUP_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const body = await request.json();
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const confirmPassword =
    typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';
  const first_name =
    typeof body?.first_name === 'string' ? body.first_name.trim() : '';
  const last_name =
    typeof body?.last_name === 'string' ? body.last_name.trim() : '';

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  if (!first_name || !last_name) {
    return NextResponse.json(
      { error: 'First name and last name are required' },
      { status: 400 }
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: 'Passwords do not match' },
      { status: 400 }
    );
  }

  // Placeholder response so the route client can attach auth/PKCE cookies.
  const cookieJar = NextResponse.json({ ok: true });
  const supabase = createSupabaseRouteClient({
    request,
    response: cookieJar,
  });
  const origin = request.nextUrl.origin;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { first_name, last_name },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.session) {
    // Preserve PKCE cookies from signUp — required for email confirmation exchange.
    const confirmResponse = NextResponse.json({
      success: true,
      requiresConfirmation: true,
    });
    copyResponseCookies(cookieJar, confirmResponse);
    return confirmResponse;
  }

  // Session issued immediately (Confirm email OFF): create profiles row now.
  if (data.user) {
    const profileResult = await ensureProfileWithNames(supabase, data.user.id, {
      first_name,
      last_name,
    });
    if (profileResult.error) {
      console.error('Profile create after signup failed:', profileResult.error);
    }
  }

  const successResponse = NextResponse.json({
    success: true,
    requiresConfirmation: false,
  });
  copyResponseCookies(cookieJar, successResponse);
  return successResponse;
}
