import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/applications/[slug]/viewer-status
 * Returns whether the current authenticated user is the owner of the application.
 * Used to show/hide the footer on the public view page (footer shown only to non-owners).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('user_id')
      .eq('slug', slug)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isOwner = user?.id === application.user_id;

    return NextResponse.json({ isOwner });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get viewer status' },
      { status: 500 }
    );
  }
}
