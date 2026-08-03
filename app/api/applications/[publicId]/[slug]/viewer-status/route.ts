import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolvePublicApplication } from '@/lib/utils/resolve-public-application';
import { handleApiError } from '@/lib/api/handle-api-error';

/**
 * GET /api/applications/[publicId]/[slug]/viewer-status
 * Returns whether the current authenticated user is the owner of the application.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string; slug: string }> }
) {
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
      data: { user },
    } = await supabase.auth.getUser();
    const isOwner = user?.id === resolved.ownerUserId;

    return NextResponse.json({ isOwner });
  } catch (error) {
    return handleApiError(
      'GET /api/applications/[publicId]/[slug]/viewer-status',
      error,
      { message: 'Failed to get viewer status' },
    );
  }
}
