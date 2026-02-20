import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const JOB_SEARCH_STATUSES = [
  'Actively searching',
  'Casually looking',
  'Career planning',
  'Other',
] as const;

const PRIMARY_GOALS = [
  'Get more interviews',
  'Track my applications',
  'Stand out to recruiters',
  'Network with recruiters',
  'Other',
] as const;

const CAREER_STAGES = [
  'Entry-level',
  'Junior (1–3 years)',
  'Mid-level (3–7 years)',
  'Senior (7+ years)',
  'Other',
] as const;

function isValidStatus(value: unknown): value is (typeof JOB_SEARCH_STATUSES)[number] {
  return typeof value === 'string' && JOB_SEARCH_STATUSES.includes(value as (typeof JOB_SEARCH_STATUSES)[number]);
}

function isValidPrimaryGoal(value: unknown): value is (typeof PRIMARY_GOALS)[number] {
  return typeof value === 'string' && PRIMARY_GOALS.includes(value as (typeof PRIMARY_GOALS)[number]);
}

function isValidCareerStage(value: unknown): value is (typeof CAREER_STAGES)[number] {
  return typeof value === 'string' && CAREER_STAGES.includes(value as (typeof CAREER_STAGES)[number]);
}

/**
 * POST /api/waitlist – add a signup to the waitlist (pre-launch landing page).
 * Email, first_name, and job_search_status are required.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const first_name = typeof body?.first_name === 'string' ? body.first_name.trim() : '';
    const job_search_status = isValidStatus(body?.job_search_status) ? body.job_search_status : null;
    const primary_goal = isValidPrimaryGoal(body?.primary_goal) ? body.primary_goal : null;
    const career_stage = isValidCareerStage(body?.career_stage) ? body.career_stage : null;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!first_name) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }

    if (!job_search_status) {
      return NextResponse.json({ error: 'Please select your job search status' }, { status: 400 });
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
      primary_goal,
      career_stage,
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
