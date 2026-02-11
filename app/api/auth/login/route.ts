import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

/**
 * Server-side login: signs in with Supabase and sets session cookies on the response.
 * This ensures the middleware can read the session on the next request.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });
  const supabase = createSupabaseRouteClient({ request, response });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (!data.session) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }

  return response;
}
