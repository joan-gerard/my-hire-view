import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/applications/[slug]/download
 * Increments download_count for the application. Skips increment when the
 * applicant (owner) is downloading their own CV, so the count reflects only
 * external downloads. Uses SECURITY DEFINER RPC via service_role (same pattern as view count).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

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

    // Don't increment when the applicant (owner) downloads their own CV
    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id === application.user_id) {
      return NextResponse.json({ success: true });
    }

    const admin = createAdminClient();
    const { error: rpcError } = await admin.rpc('increment_application_download_count', {
      p_slug: slug,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: 'Failed to update download count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
