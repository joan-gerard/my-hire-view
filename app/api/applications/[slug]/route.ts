import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkBlobExists } from '@/lib/utils/blob';
import { checkRateLimit, rateLimit429 } from '@/lib/rate-limit';

/** Public GET: 120 requests per minute per IP to allow normal viewing while limiting scraping. */
const PUBLIC_APPLICATION_GET_LIMIT = { limit: 120, windowMs: 60_000 };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rate = checkRateLimit(request, PUBLIC_APPLICATION_GET_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const cv_exists = data.cv_url
      ? await checkBlobExists(data.cv_url)
      : undefined;

    return NextResponse.json({
      data: { ...data, cv_exists },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
