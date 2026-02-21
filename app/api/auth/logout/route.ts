import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

/** 20 logout requests per minute per IP. */
const LOGOUT_RATE_LIMIT = { limit: 20, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, LOGOUT_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const response = NextResponse.json({ success: true });
  const supabase = createSupabaseRouteClient({ request, response });

  await supabase.auth.signOut();
  return response;
}
