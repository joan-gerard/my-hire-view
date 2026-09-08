import { NextResponse, type NextRequest } from 'next/server';
import { createInitialProfile } from '@/lib/auth/create-initial-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import {
  copyResponseCookies,
  createSupabaseRouteClient,
} from '@/lib/supabase/route-client';
import { generatePublicId } from '@/lib/utils/public-id';
import {
  formatSignupZodError,
  GENERIC_SIGNUP_ERROR,
  signupBodySchema,
} from '@/lib/validation/auth';

/** 5 signup attempts per minute per IP to mitigate abuse. */
const SIGNUP_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

/**
 * Server-side signup: creates a user, stores first/last name + public_id in Auth
 * user_metadata, creates a profiles row (service role; works with or without a
 * session), and sets session cookies when email confirmation is not required.
 *
 * When confirmation is required, PKCE cookies written during signUp must still
 * be returned so /auth/callback can exchange the email link code later.
 * Immediate-session profile insert failures retry once; login also bootstraps.
 *
 * F1-040 / F1-041: Zod body validation (email format, password ≥ 8 + special
 * char); generic Auth errors; malformed JSON → 400; unexpected Auth failures logged.
 */
export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(request, SIGNUP_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = signupBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatSignupZodError(parsed.error) },
      { status: 400 },
    );
  }
  const { email, password, first_name, last_name } = parsed.data;

  // Placeholder response so the route client can attach auth/PKCE cookies.
  const cookieJar = NextResponse.json({ ok: true });
  const supabase = createSupabaseRouteClient({
    request,
    response: cookieJar,
  });
  const origin = request.nextUrl.origin;

  const public_id = generatePublicId();

  let data;
  let error;
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: { first_name, last_name, public_id },
      },
    });
    data = result.data;
    error = result.error;
  } catch (err) {
    console.error('[auth/signup] unexpected Auth API failure:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }

  if (error) {
    // Do not forward provider messages like "User already registered" (F1-040).
    console.warn('[auth/signup] sign-up rejected:', error.message);
    return NextResponse.json({ error: GENERIC_SIGNUP_ERROR }, { status: 400 });
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
