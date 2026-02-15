import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { deleteBlobIfOurs } from '@/lib/utils/blob';
import type { ApplicationCreateInput, ApplicationUpdateInput } from '@/lib/types/application';

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

async function getProfileSnapshot(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, location, portfolio_url, linkedin_url')
    .eq('user_id', userId)
    .single();
  return {
    first_name: data?.first_name ?? null,
    last_name: data?.last_name ?? null,
    location: data?.location ?? null,
    portfolio_url: data?.portfolio_url ?? null,
    linkedin_url: data?.linkedin_url ?? null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body: ApplicationCreateInput = await request.json();
    const snapshot = await getProfileSnapshot(supabase, user.id);

    const candidateFields = {
      first_name: body.first_name !== undefined ? body.first_name : snapshot.first_name,
      last_name: body.last_name !== undefined ? body.last_name : snapshot.last_name,
      location: body.location !== undefined ? body.location : snapshot.location,
      portfolio_url: body.portfolio_url !== undefined ? body.portfolio_url : snapshot.portfolio_url,
      linkedin_url: body.linkedin_url !== undefined ? body.linkedin_url : snapshot.linkedin_url,
    };

    const { data, error } = await supabase
      .from('applications')
      .insert({
        company: body.company,
        role: body.role,
        slug: body.slug,
        cv_url: body.cv_url,
        video_url: body.video_url,
        description: body.description ?? null,
        user_id: user.id,
        ...candidateFields,
        include_name_in_slug: body.slugNamePosition ?? null,
        cv_filename: body.cv_filename ?? null,
        use_original_cv_filename: body.use_original_cv_filename ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body: ApplicationUpdateInput & { id: string } = await request.json();
    const { id, slugNamePosition, ...rest } = body;

    const updatePayload = {
      ...rest,
      ...(slugNamePosition !== undefined && { include_name_in_slug: slugNamePosition }),
    };

    // Verify the application belongs to the user and get current cv_url
    const { data: existing } = await supabase
      .from('applications')
      .select('user_id, cv_url')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

    const newCvUrl = updatePayload.cv_url as string | undefined;
    if (
      newCvUrl !== undefined &&
      existing.cv_url &&
      newCvUrl !== existing.cv_url
    ) {
      await deleteBlobIfOurs(existing.cv_url);
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Verify the application belongs to the user and get cv_url for blob cleanup
    const { data: existing } = await supabase
      .from('applications')
      .select('user_id, cv_url')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

    await deleteBlobIfOurs(existing.cv_url);

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
