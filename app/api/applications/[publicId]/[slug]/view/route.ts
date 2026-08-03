import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from '@/lib/rate-limit';
import { resolvePublicApplication } from '@/lib/utils/resolve-public-application';
import { handleApiError } from '@/lib/api/handle-api-error';

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
    const { error: rpcError } = await admin.rpc('increment_application_view_count', {
      p_public_id: publicId,
      p_slug: slug,
    });

    if (rpcError) {
      return handleApiError(
        'POST /api/applications/[publicId]/[slug]/view RPC',
        rpcError,
        { message: 'Failed to update view count' },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(
      'POST /api/applications/[publicId]/[slug]/view',
      error,
      { message: 'Failed to track view' },
    );
  }
}
