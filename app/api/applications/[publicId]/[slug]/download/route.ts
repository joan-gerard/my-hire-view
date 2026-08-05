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

/**
 * POST /api/applications/[publicId]/[slug]/download
 * Increments download_count for the application. Skips increment when the
 * applicant (owner) is downloading their own CV. Unavailable apps (archived /
 * draft) return 404 and are not counted. Repeats within the dedupe cookie TTL
 * are acknowledged without counting. Requires a same-origin signal (Origin /
 * Referer / Sec-Fetch-Site) as defense in depth against trivial cross-site spam.
 */
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

    if (hasAnalyticsDedupeCookie(request, 'download', publicId, slug)) {
      return NextResponse.json({ success: true });
    }

    const resolved = await resolvePublicApplication(publicId, slug);
    if (!resolved || !isApplicationPubliclyVisible(resolved.application.status)) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id === resolved.ownerUserId) {
      const response = NextResponse.json({ success: true });
      setAnalyticsDedupeCookie(response, 'download', publicId, slug);
      return response;
    }

    const admin = createAdminClient();
    const { error: rpcError } = await admin.rpc('increment_application_download_count', {
      p_public_id: publicId,
      p_slug: slug,
    });

    if (rpcError) {
      return handleApiError(
        'POST /api/applications/[publicId]/[slug]/download RPC',
        rpcError,
        {
          message: 'Failed to update download count',
          meta: {
            publicId,
            slug,
            code: rpcError.code,
          },
        },
      );
    }

    const response = NextResponse.json({ success: true });
    setAnalyticsDedupeCookie(response, 'download', publicId, slug);
    return response;
  } catch (error) {
    return handleApiError(
      'POST /api/applications/[publicId]/[slug]/download',
      error,
      { message: 'Failed to track download' },
    );
  }
}
