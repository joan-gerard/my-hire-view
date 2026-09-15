import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkCvObjectExists } from '@/lib/utils/cv-storage';
import { cacheBustProfilePictureUrl } from '@/lib/utils/profile-picture-storage';
import { checkRateLimit, DEFAULT_API_RATE_LIMIT, rateLimit429 } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api/handle-api-error';
import { withAuth } from '@/lib/api/with-auth';

/**
 * GET a single application by id. Requires auth; returns 404 if not found or not owned by user.
 * When `cv_url` is our R2 public URL, adds `cv_exists` (HeadObject). URLs outside our
 * R2 public base omit `cv_exists` so the edit UI does not treat them as missing.
 * When `show_profile_picture` is true, attaches display-only `profile_picture_url`
 * from the owner's profile (same resolution as public share / draft preview SSR).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rate = await checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const auth = await withAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

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

    let profile_picture_url: string | null = null;
    if (data.show_profile_picture === true) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_picture_url, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();
      const liveUrl = profile?.profile_picture_url?.trim() || null;
      profile_picture_url = cacheBustProfilePictureUrl(
        liveUrl,
        profile?.updated_at ?? null,
      );
    }

    return NextResponse.json({
      data: { ...data, cv_exists, profile_picture_url },
    });
  } catch (error) {
    return handleApiError(
      'GET /api/applications/by-id/[id]',
      error,
      { message: 'Failed to fetch application' },
    );
  }
}
