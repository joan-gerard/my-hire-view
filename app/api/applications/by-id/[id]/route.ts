import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { checkCvObjectExists } from '@/lib/utils/cv-storage';
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api/handle-api-error';

/**
 * GET a single application by id. Requires auth; returns 404 if not found or not owned by user.
 * When `cv_url` is our R2 public URL, adds `cv_exists` (HeadObject). URLs outside our
 * R2 public base omit `cv_exists` so the edit UI does not treat them as missing.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;

    const idParsed = z
      .uuid({ error: 'Application ID must be a valid UUID' })
      .safeParse(rawId.trim());
    if (!idParsed.success) {
      return NextResponse.json(
        { error: 'Application ID must be a valid UUID' },
        { status: 400 },
      );
    }
    const id = idParsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const cv_exists = data.cv_url
      ? await checkCvObjectExists(data.cv_url)
      : undefined;

    return NextResponse.json({
      data: { ...data, cv_exists },
    });
  } catch (error) {
    return handleApiError(
      'GET /api/applications/by-id/[id]',
      error,
      { message: 'Failed to fetch application' },
    );
  }
}
