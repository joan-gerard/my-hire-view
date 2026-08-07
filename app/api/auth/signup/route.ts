import { NextResponse, type NextRequest } from 'next/server';
import { createInitialProfile } from '@/lib/auth/create-initial-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import {
  copyResponseCookies,
  createSupabaseRouteClient,
} from '@/lib/supabase/route-client';
import { generatePublicId } from '@/lib/utils/public-id';

/** 5 signup attempts per minute per IP to mitigate abuse. */
const SIGNUP_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

const MIN_PASSWORD_LENGTH = 6;

/**
 * Server-side signup: creates a user, stores first/last name + public_id in Auth
 * user_metadata, creates a profiles row (service role; works with or without a
 * session), and sets session cookies when email confirmation is not required.
 *
 * When confirmation is required, PKCE cookies written during signUp must still
 * be returned so /auth/callback can exchange the email link code later.
 * Immediate-session profile insert failures retry once; login also bootstraps.
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

  const public_id = generatePublicId();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { first_name, last_name, public_id },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (userId) {
    let profileResult = await createInitialProfile({
      userId,
      first_name,
      last_name,
      public_id,
    });
    // Immediate-session path never hits /auth/callback — one extra try here,
    // then login bootstrap covers remaining gaps (C1-009).
    if (profileResult.error && data.session) {
      profileResult = await createInitialProfile({
        userId,
        first_name,
        last_name,
        public_id,
      });
    }
    if (profileResult.error) {
      console.error(
        'Signup succeeded but profiles row failed:',
        profileResult.error,
      );
      // Do not fail signup — confirmation callback and/or login bootstrap retry.
    }
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

  const successResponse = NextResponse.json({
    success: true,
    requiresConfirmation: false,
  });
  copyResponseCookies(cookieJar, successResponse);
  return successResponse;
}
