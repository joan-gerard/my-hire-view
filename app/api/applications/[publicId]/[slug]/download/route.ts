import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from '@/lib/rate-limit';
import { resolvePublicApplication } from '@/lib/utils/resolve-public-application';

/**
 * POST /api/applications/[publicId]/[slug]/download
 * Increments download_count for the application. Skips increment when the
 * applicant (owner) is downloading their own CV.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; slug: string }> }
) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const supabase = await createClient();
    const { publicId, slug } = await params;

    const resolved = await resolvePublicApplication(supabase, publicId, slug);
    if (!resolved) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id === resolved.ownerUserId) {
      return NextResponse.json({ success: true });
    }

    const admin = createAdminClient();
    const { error: rpcError } = await admin.rpc('increment_application_download_count', {
      p_public_id: publicId,
      p_slug: slug,
    });

    if (rpcError) {
      return NextResponse.json(
        { error: 'Failed to update download count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
