import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { loadPublicApplicationResponse } from '@/lib/utils/load-public-application-response';
import { handleApiError } from '@/lib/api/handle-api-error';

/** Public GET: 120 requests per minute per IP to allow normal viewing while limiting scraping. */
const PUBLIC_APPLICATION_GET_LIMIT = { limit: 120, windowMs: 60_000 };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; slug: string }> }
) {
  const rate = checkRateLimit(request, PUBLIC_APPLICATION_GET_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const { publicId, slug } = await params;

    const data = await loadPublicApplicationResponse(publicId, slug);
    if (!data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(
      'GET /api/applications/[publicId]/[slug]',
      error,
      { message: 'Failed to fetch application' },
    );
  }
}
