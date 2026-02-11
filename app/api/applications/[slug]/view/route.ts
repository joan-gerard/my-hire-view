import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // Get current view count
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('view_count')
      .eq('slug', slug)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Increment view count
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
