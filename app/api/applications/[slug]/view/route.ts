import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // Get application with view count and owner for self-view check
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('view_count, user_id')
      .eq('slug', slug)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Don't increment when the applicant (owner) views their own application
    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id === application.user_id) {
      return NextResponse.json({ success: true });
    }

    // Increment view count for other viewers
    const { error: updateError } = await supabase
      .from('applications')
      .update({ view_count: (application.view_count || 0) + 1 })
      .eq('slug', slug);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update view count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
