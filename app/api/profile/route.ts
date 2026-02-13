import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import type { ProfileUpdateInput } from '@/lib/types/profile';

/** Validates URL format; allows http/https only. Returns error message or null. */
function validateUrl(value: string | null | undefined): string | null {
  if (value == null || value.trim() === '') return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'URL must use http or https';
    }
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row: create one and return
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 400 });
        }
        return NextResponse.json({ data: inserted });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body: ProfileUpdateInput = await request.json();

    const portfolioError = validateUrl(body.portfolio_url);
    if (portfolioError) {
      return NextResponse.json(
        { error: `Portfolio URL: ${portfolioError}` },
        { status: 400 }
      );
    }
    const linkedinError = validateUrl(body.linkedin_url);
    if (linkedinError) {
      return NextResponse.json(
        { error: `LinkedIn URL: ${linkedinError}` },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const merged = {
      user_id: user.id,
      first_name: body.first_name !== undefined ? body.first_name ?? null : (existing?.first_name ?? null),
      last_name: body.last_name !== undefined ? body.last_name ?? null : (existing?.last_name ?? null),
      location: body.location !== undefined ? body.location ?? null : (existing?.location ?? null),
      portfolio_url: body.portfolio_url !== undefined ? body.portfolio_url ?? null : (existing?.portfolio_url ?? null),
      linkedin_url: body.linkedin_url !== undefined ? body.linkedin_url ?? null : (existing?.linkedin_url ?? null),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(merged, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
