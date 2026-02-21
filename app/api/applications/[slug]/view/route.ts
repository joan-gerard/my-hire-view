import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const supabase = await createClient();
    const { slug } = await params;

    // Get application with owner for self-view check (using cookie-based client)
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('user_id')
      .eq('slug', slug)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Don't increment when the applicant (owner) views their own application
    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id === application.user_id) {
      return NextResponse.json({ success: true });
    }

    // Increment view count and last_viewed_at via SECURITY DEFINER RPC (service_role only)
    const admin = createAdminClient();
    const { error: rpcError } = await admin.rpc('increment_application_view_count', {
      p_slug: slug,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: 'Failed to update view count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
