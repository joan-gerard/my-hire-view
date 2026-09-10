import { readLimitedJsonBody } from '@/lib/api/read-limited-json-body';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  formatWaitlistZodError,
  isRawWaitlistHoneypotTriggered,
  isWaitlistHoneypotTriggered,
  WAITLIST_REQUEST_BODY_MAX_BYTES,
  waitlistBodySchema,
} from '@/lib/validation/waitlist';
import { NextResponse, type NextRequest } from 'next/server';

/** 5 signup attempts per minute per IP. */
const WAITLIST_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

/**
 * POST /api/waitlist – add a signup to the waitlist (pre-launch landing page).
 * Email, first_name, and job_search_status are required.
 * F3-039: filled honeypot → silent 200 (no insert), checked before Zod so bots
 * cannot probe validation. F3-064: Zod name/email rules.
 */
export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(request, WAITLIST_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const bodyResult = await readLimitedJsonBody(
      request,
      WAITLIST_REQUEST_BODY_MAX_BYTES,
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

    // Before Zod: filled honeypot → silent 200 (no validation leak to bots).
    if (isRawWaitlistHoneypotTriggered(bodyResult.value)) {
      return NextResponse.json({ success: true });
    }

    const parsed = waitlistBodySchema.safeParse(bodyResult.value);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatWaitlistZodError(parsed.error) },
        { status: 400 },
      );
    }

    // Defense in depth if schema ever accepts a filled honeypot again.
    if (isWaitlistHoneypotTriggered(parsed.data)) {
      return NextResponse.json({ success: true });
    }

    const {
      email,
      first_name,
      job_search_status,
      primary_goal = null,
      career_stage = null,
    } = parsed.data;

    const supabase = createAdminClient();
    const { error } = await supabase.from('waitlist_signups').insert({
      email: email.toLowerCase(),
      first_name,
      job_search_status,
      primary_goal,
      career_stage,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist.' },
          { status: 409 },
        );
      }
      console.error('Waitlist signup error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
