import { requireAuth } from "@/lib/auth";
import {
  ensureProfilePublicId,
  resolvePublicIdReadOnly,
} from "@/lib/auth/ensure-public-id";
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
  type ApplicationCvKind,
  type ApplicationStatus,
  type ApplicationUpdateInput,
} from "@/lib/types/application";
import {
  checkCvObjectExists,
  deleteApplicationCvIfCustom,
} from "@/lib/utils/cv-storage";
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

function isValidStatus(value: unknown): value is ApplicationStatus {
  return value === "active" || value === "draft" || value === "archived";
}

function isValidCvKind(value: unknown): value is ApplicationCvKind {
  return value === "master" || value === "custom";
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

    const publicId = (await resolvePublicIdReadOnly(supabase, user)) ?? "";
    const rows = data ?? [];
    const existence = await Promise.all(
      rows.map((row) => checkCvObjectExists(row.cv_url)),
    );
    const items = rows.map((row, i) => ({
      ...row,
      public_id: publicId,
      cv_exists: existence[i] ?? false,
    }));

    return NextResponse.json({
      data: items,
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
    .select("first_name, last_name, location, portfolio_url, linkedin_url")
    .eq("user_id", userId)
    .single();
  return {
    first_name: data?.first_name ?? null,
    last_name: data?.last_name ?? null,
    location: data?.location ?? null,
    portfolio_url: data?.portfolio_url ?? null,
    linkedin_url: data?.linkedin_url ?? null,
  };
}

async function resolveMasterCvForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  masterCvId: string,
): Promise<{ url: string; filename: string } | null> {
  const { data } = await supabase
    .from("master_cvs")
    .select("url, filename")
    .eq("id", masterCvId)
    .eq("user_id", userId)
    .single();
  if (!data?.url) return null;
  return { url: data.url, filename: data.filename };
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const user = await requireAuth();
    const supabase = await createClient();
    await ensureProfilePublicId(supabase, user);
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

    const cvKind: ApplicationCvKind =
      body.cv_kind === "master" ? "master" : "custom";
    let cvUrl = body.cv_url;
    let cvFilename = body.cv_filename ?? null;
    let masterCvId: string | null = null;

    if (cvKind === "master") {
      if (!body.master_cv_id) {
        return NextResponse.json(
          { error: "master_cv_id is required when cv_kind is master" },
          { status: 400 },
        );
      }
      const master = await resolveMasterCvForUser(
        supabase,
        user.id,
        body.master_cv_id,
      );
      if (!master) {
        return NextResponse.json(
          { error: "Master CV not found" },
          { status: 400 },
        );
      }
      cvUrl = master.url;
      cvFilename = master.filename;
      masterCvId = body.master_cv_id;
    }

    const status: ApplicationStatus = isValidStatus(body.status)
      ? body.status
      : "active";

    const { data, error } = await supabase
      .from("applications")
      .insert({
        company: body.company,
        role: body.role,
        slug: body.slug,
        cv_url: cvUrl,
        video_url: body.video_url,
        user_id: user.id,
        status,
        archived_at: status === "archived" ? new Date().toISOString() : null,
        ...candidateFields,
        include_name_in_slug: body.slugNamePosition ?? null,
        cv_filename: cvFilename,
        use_original_cv_filename: body.use_original_cv_filename ?? true,
        show_profile_picture: showProfilePicture,
        cv_kind: cvKind,
        master_cv_id: masterCvId,
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
    const {
      id,
      slugNamePosition,
      show_profile_picture,
      status,
      cv_kind,
      master_cv_id,
      cv_url,
      cv_filename,
      ...rest
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    const updatePayload: Record<string, unknown> = { ...rest };
    delete updatePayload.description; // Column removed in migration 017
    delete updatePayload.is_active; // Replaced by status (migration 021)
    delete updatePayload.archived_at; // Server-managed with status

    if (slugNamePosition !== undefined) {
      updatePayload.include_name_in_slug = slugNamePosition;
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("user_id, cv_url, cv_kind, status")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 },
        );
      }
      updatePayload.status = status;
      if (status === "archived") {
        // Always reset the retention clock when (re-)archiving
        updatePayload.archived_at = new Date().toISOString();
      } else {
        updatePayload.archived_at = null;
      }
    }

    const cvFieldsTouched =
      cv_kind !== undefined ||
      master_cv_id !== undefined ||
      cv_url !== undefined ||
      cv_filename !== undefined;

    if (cvFieldsTouched) {
      let nextCvKind: ApplicationCvKind =
        cv_kind !== undefined
          ? cv_kind
          : ((existing.cv_kind as ApplicationCvKind) ?? "custom");

      if (cv_kind !== undefined) {
        if (!isValidCvKind(cv_kind)) {
          return NextResponse.json(
            { error: "Invalid cv_kind" },
            { status: 400 },
          );
        }
        updatePayload.cv_kind = cv_kind;
      }

      let nextCvUrl = existing.cv_url as string;

      if (nextCvKind === "master") {
        const masterId = master_cv_id ?? null;
        if (!masterId) {
          return NextResponse.json(
            { error: "master_cv_id is required when cv_kind is master" },
            { status: 400 },
          );
        }
        const master = await resolveMasterCvForUser(
          supabase,
          user.id,
          masterId,
        );
        if (!master) {
          return NextResponse.json(
            { error: "Master CV not found" },
            { status: 400 },
          );
        }
        nextCvUrl = master.url;
        updatePayload.cv_url = master.url;
        updatePayload.cv_filename = master.filename;
        updatePayload.master_cv_id = masterId;
        updatePayload.cv_kind = "master";
      } else {
        if (cv_url !== undefined) {
          nextCvUrl = cv_url;
          updatePayload.cv_url = cv_url;
        }
        if (cv_filename !== undefined) {
          updatePayload.cv_filename = cv_filename;
        }
        updatePayload.master_cv_id = null;
        updatePayload.cv_kind = "custom";
      }

      if (nextCvUrl !== existing.cv_url) {
        await deleteApplicationCvIfCustom(
          existing.cv_url,
          existing.cv_kind as ApplicationCvKind,
        );
      }
    }

    if (show_profile_picture !== undefined) {
      updatePayload.show_profile_picture = show_profile_picture === true;
    }

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

    const { data: existing } = await supabase
      .from("applications")
      .select("user_id, cv_url, cv_kind")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    await deleteApplicationCvIfCustom(
      existing.cv_url,
      existing.cv_kind as ApplicationCvKind,
    );

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
