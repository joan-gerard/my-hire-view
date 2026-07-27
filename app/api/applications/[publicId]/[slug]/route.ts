import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkCvObjectExists } from '@/lib/utils/cv-storage';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';
import { resolvePublicApplication } from '@/lib/utils/resolve-public-application';

/** Public GET: 120 requests per minute per IP to allow normal viewing while limiting scraping. */
const PUBLIC_APPLICATION_GET_LIMIT = { limit: 120, windowMs: 60_000 };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; slug: string }> }
) {
  const rate = checkRateLimit(request, PUBLIC_APPLICATION_GET_LIMIT);
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

    const data = resolved.application;
    const cv_exists = data.cv_url
      ? await checkCvObjectExists(data.cv_url)
      : undefined;

    return NextResponse.json({
      data: { ...data, cv_exists },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
