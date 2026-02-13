import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { checkBlobExists } from '@/lib/utils/blob';

/**
 * GET a single application by id. Requires auth; returns 404 if not found or not owned by user.
 * When cv_url is a Vercel Blob URL, adds cv_exists (HEAD check) so the client can hide the View link if the file is missing.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { id } = await params;

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
      ? await checkBlobExists(data.cv_url)
      : undefined;

    return NextResponse.json({
      data: { ...data, cv_exists },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
