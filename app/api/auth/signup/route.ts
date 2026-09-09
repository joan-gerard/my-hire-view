import { NextResponse, type NextRequest } from 'next/server';
import { readLimitedJsonBody } from '@/lib/api/read-limited-json-body';
import { createInitialProfile } from '@/lib/auth/create-initial-profile';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import {
  copyResponseCookies,
  createSupabaseRouteClient,
} from '@/lib/supabase/route-client';
import { generatePublicId } from '@/lib/utils/public-id';
import {
  AUTH_REQUEST_BODY_MAX_BYTES,
  formatSignupZodError,
  GENERIC_SIGNUP_ERROR,
  signupBodySchema,
} from '@/lib/validation/auth';

/** 5 signup attempts per minute per IP to mitigate abuse. */
const SIGNUP_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

/** Same body as a confirmation-required signup — used for duplicates (F1-040). */
function duplicateSignupResponse(): NextResponse {
  return NextResponse.json({
    success: true,
    requiresConfirmation: true,
  });
}

function isDuplicateSignupError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('already registered') ||
    normalized.includes('already been registered') ||
    normalized.includes('user already exists') ||
    normalized.includes('email address is already')
  );
}

/**
 * Server-side signup: creates a user, stores first/last name + public_id in Auth
 * user_metadata, creates a profiles row (service role; works with or without a
 * session), and sets session cookies when email confirmation is not required.
 *
 * When confirmation is required, PKCE cookies written during signUp must still
 * be returned so /auth/callback can exchange the email link code later.
 * Immediate-session profile insert failures retry once; login also bootstraps.
 *
 * F1-040 / F1-041: Zod body validation (email format, password ≥ 8 code points +
 * special char); generic Auth errors; duplicate emails return the same 200
 * confirmation response as a new signup (no status-code enumeration).
 */
export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(request, SIGNUP_RATE_LIMIT);
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
    if (isDuplicateSignupError(error.message)) {
      // Match confirmation-required success so status/body do not enumerate emails.
      console.warn('[auth/signup] duplicate sign-up masked:', error.message);
      return duplicateSignupResponse();
    }
    console.warn('[auth/signup] sign-up rejected:', error.message);
    return NextResponse.json({ error: GENERIC_SIGNUP_ERROR }, { status: 400 });
  }

  // When Confirm email is on, Supabase may return an obfuscated user with no
  // identities for an existing email — treat like a confirmation-required signup.
  const identities = data.user?.identities;
  if (
    data.user &&
    !data.session &&
    Array.isArray(identities) &&
    identities.length === 0
  ) {
    console.warn('[auth/signup] obfuscated duplicate sign-up masked');
    return duplicateSignupResponse();
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
