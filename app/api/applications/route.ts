import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
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

    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...body,
        user_id: user.id,
        ...snapshot,
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
    const { id, ...updateData } = body;

    // Verify the application belongs to the user
    const { data: existing } = await supabase
      .from('applications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

    const snapshot = await getProfileSnapshot(supabase, user.id);
    const { data, error } = await supabase
      .from('applications')
      .update({ ...updateData, ...snapshot })
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

    // Verify the application belongs to the user
    const { data: existing } = await supabase
      .from('applications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not found or unauthorized' },
        { status: 404 }
      );
    }

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
