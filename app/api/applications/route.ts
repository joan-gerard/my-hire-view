import { requireAuth } from "@/lib/auth";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  APPLICATION_LIST_DEFAULT_LIMIT,
  APPLICATION_LIST_MAX_LIMIT,
  APPLICATION_LIST_SELECT,
  type ApplicationCreateInput,
  type ApplicationUpdateInput,
} from "@/lib/types/application";
import { deleteCvIfOurs } from "@/lib/utils/cv-storage";
import { NextRequest, NextResponse } from "next/server";

function parseLimit(raw: string | null): number {
  if (raw === null || raw === "") return APPLICATION_LIST_DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return APPLICATION_LIST_DEFAULT_LIMIT;
  return Math.min(n, APPLICATION_LIST_MAX_LIMIT);
}

function parseOffset(raw: string | null): number {
  if (raw === null || raw === "") return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/** Strip characters that break PostgREST `or`/`ilike` filters; cap length. */
function normalizeListSearchQuery(raw: string | null): string | null {
  if (raw === null) return null;
  const cleaned = raw
    .trim()
    .slice(0, 100)
    .replace(/[%_,.()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export async function GET(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));
    const offset = parseOffset(searchParams.get("offset"));
    const q = normalizeListSearchQuery(searchParams.get("q"));

    const supabase = await createClient();

    let query = supabase
      .from("applications")
      .select(APPLICATION_LIST_SELECT, { count: "exact" })
      .eq("user_id", user.id);

    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `company.ilike."${pattern}",role.ilike."${pattern}",slug.ilike."${pattern}"`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("GET /api/applications:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      meta: {
        limit,
        offset,
        total: count ?? 0,
      },
    });
  } catch (error) {
    console.error("GET /api/applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

async function getProfileSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, location, portfolio_url, linkedin_url, profile_picture_url",
    )
    .eq("user_id", userId)
    .single();
  return {
    first_name: data?.first_name ?? null,
    last_name: data?.last_name ?? null,
    location: data?.location ?? null,
    portfolio_url: data?.portfolio_url ?? null,
    linkedin_url: data?.linkedin_url ?? null,
    profile_picture_url: data?.profile_picture_url ?? null,
  };
}

/** Set application profile_picture_url from profile when user chose to show it. */
function resolveProfilePictureUrl(
  snapshot: { profile_picture_url: string | null },
  showProfilePicture: boolean,
): string | null {
  const url = snapshot.profile_picture_url?.trim() || null;
  if (!url || !showProfilePicture) return null;
  return url;
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body: ApplicationCreateInput = await request.json();
    const snapshot = await getProfileSnapshot(supabase, user.id);

    const candidateFields = {
      first_name:
        body.first_name !== undefined ? body.first_name : snapshot.first_name,
      last_name:
        body.last_name !== undefined ? body.last_name : snapshot.last_name,
      location: body.location !== undefined ? body.location : snapshot.location,
      portfolio_url:
        body.portfolio_url !== undefined
          ? body.portfolio_url
          : snapshot.portfolio_url,
      linkedin_url:
        body.linkedin_url !== undefined
          ? body.linkedin_url
          : snapshot.linkedin_url,
    };

    const showProfilePicture = body.show_profile_picture === true;
    const profilePictureUrl = resolveProfilePictureUrl(
      snapshot,
      showProfilePicture,
    );

    const { data, error } = await supabase
      .from("applications")
      .insert({
        company: body.company,
        role: body.role,
        slug: body.slug,
        cv_url: body.cv_url,
        video_url: body.video_url,
        user_id: user.id,
        ...candidateFields,
        include_name_in_slug: body.slugNamePosition ?? null,
        cv_filename: body.cv_filename ?? null,
        use_original_cv_filename: body.use_original_cv_filename ?? true,
        profile_picture_url: profilePictureUrl,
        show_profile_picture: showProfilePicture,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body: ApplicationUpdateInput & { id: string } = await request.json();
    const { id, slugNamePosition, show_profile_picture, ...rest } = body;

    const updatePayload: Record<string, unknown> = {
      ...rest,
      ...(slugNamePosition !== undefined && {
        include_name_in_slug: slugNamePosition,
      }),
      ...(show_profile_picture !== undefined && {
        show_profile_picture: show_profile_picture === true,
      }),
    };
    delete updatePayload.description; // Column removed in migration 017

    // Verify the application belongs to the user and get current cv_url
    const { data: existing } = await supabase
      .from("applications")
      .select("user_id, cv_url")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    const newCvUrl = updatePayload.cv_url as string | undefined;
    if (
      newCvUrl !== undefined &&
      existing.cv_url &&
      newCvUrl !== existing.cv_url
    ) {
      await deleteCvIfOurs(existing.cv_url);
    }

    const snapshot = await getProfileSnapshot(supabase, user.id);
    const showProfilePicture = show_profile_picture === true;
    updatePayload.profile_picture_url = resolveProfilePictureUrl(
      snapshot,
      showProfilePicture,
    );

    const { data, error } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Verify the application belongs to the user and get cv_url for R2 cleanup
    const { data: existing } = await supabase
      .from("applications")
      .select("user_id, cv_url")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    await deleteCvIfOurs(existing.cv_url);

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
