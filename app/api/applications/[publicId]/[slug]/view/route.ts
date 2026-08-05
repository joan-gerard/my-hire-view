import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  checkRateLimit,
  checkPerSlugRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from '@/lib/rate-limit';
import { resolvePublicApplication } from '@/lib/utils/resolve-public-application';
import { isApplicationPubliclyVisible } from '@/lib/types/application';
import { handleApiError } from '@/lib/api/handle-api-error';
import {
  hasAnalyticsDedupeCookie,
  setAnalyticsDedupeCookie,
} from '@/lib/api/analytics-dedupe';
import { isSameOriginAnalyticsRequest } from '@/lib/api/same-origin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; slug: string }> }
) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const { publicId, slug } = await params;

    const perSlug = checkPerSlugRateLimit(request, publicId, slug);
    if (!perSlug.success) return rateLimit429(perSlug);

    if (!isSameOriginAnalyticsRequest(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (hasAnalyticsDedupeCookie(request, 'view', publicId, slug)) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const resolved = await resolvePublicApplication(supabase, publicId, slug);
    if (!resolved || !isApplicationPubliclyVisible(resolved.application.status)) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id === resolved.ownerUserId) {
      const response = NextResponse.json({ success: true });
      setAnalyticsDedupeCookie(response, 'view', publicId, slug);
      return response;
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
        {
          message: 'Failed to update view count',
          meta: {
            publicId,
            slug,
            code: rpcError.code,
          },
        },
      );
    }

    const response = NextResponse.json({ success: true });
    setAnalyticsDedupeCookie(response, 'view', publicId, slug);
    return response;
  } catch (error) {
    return handleApiError(
      'POST /api/applications/[publicId]/[slug]/view',
      error,
      { message: 'Failed to track view' },
    );
  }
}
