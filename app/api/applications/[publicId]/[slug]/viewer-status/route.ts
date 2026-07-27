import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolvePublicApplication } from '@/lib/utils/resolve-public-application';

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
  } catch {
    return NextResponse.json(
      { error: 'Failed to get viewer status' },
      { status: 500 }
    );
  }
}
