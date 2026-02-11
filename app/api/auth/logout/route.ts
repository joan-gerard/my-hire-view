import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  const supabase = createSupabaseRouteClient({ request, response });

  await supabase.auth.signOut();
  return response;
}
