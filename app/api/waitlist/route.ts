import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

/** 5 signup attempts per minute per IP. */
const WAITLIST_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

const JOB_SEARCH_STATUSES = [
  'Actively searching',
  'Casually looking',
  'Career planning',
  'Other',
] as const;

function isValidStatus(value: unknown): value is (typeof JOB_SEARCH_STATUSES)[number] {
  return typeof value === 'string' && JOB_SEARCH_STATUSES.includes(value as (typeof JOB_SEARCH_STATUSES)[number]);
}

/**
 * POST /api/waitlist – add a signup to the waitlist (pre-launch landing page).
 * Email required; first_name and job_search_status optional.
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, WAITLIST_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const first_name = typeof body?.first_name === 'string' ? body.first_name.trim() || null : null;
    const job_search_status = isValidStatus(body?.job_search_status) ? body.job_search_status : null;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('waitlist_signups').insert({
      email: email.toLowerCase(),
      first_name,
      job_search_status,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist.' },
          { status: 409 }
        );
      }
      console.error('Waitlist signup error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
