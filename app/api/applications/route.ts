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
  type ApplicationCvType,
  type ApplicationStatus,
} from "@/lib/types/application";
import {
  checkCvObjectExists,
  deleteApplicationCvIfTailored,
  getCvObjectKeyFromPublicUrl,
  isOwnedTailoredCvUrl,
  toCanonicalCvPublicUrl,
} from "@/lib/utils/cv-storage";
import {
  SLUG_COLLISION_USER_MESSAGE,
  validateSlugForApplication,
} from "@/lib/utils/slug";
import {
  applicationCreateSchema,
  applicationUpdateSchema,
  formatApplicationCreateZodError,
  formatApplicationUpdateZodError,
} from "@/lib/validation/application";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    const publicId = (await resolvePublicIdReadOnly(supabase, user)) ?? "";
    const rows = data ?? [];
    const existence = await Promise.all(
      rows.map((row) => checkCvObjectExists(row.cv_url)),
    );
    const items = rows.map((row, i) => ({
      ...row,
      public_id: publicId,
      // Non-R2 / unchecked URLs → true so they are not flagged missing
      cv_exists: existence[i] ?? true,
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

async function resolvePrimaryCvForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  primaryCvId: string,
): Promise<{ url: string; filename: string } | null> {
  const { data } = await supabase
    .from("primary_cvs")
    .select("url, filename")
    .eq("id", primaryCvId)
    .eq("user_id", userId)
    .single();
  if (!data?.url) return null;
  return { url: data.url, filename: data.filename };
}

/**
 * Tailored CVs are one application ↔ one R2 object. Compares decoded object keys
 * so percent-encoded URL variants of the same object count as in use.
 * Partial unique index `applications_user_id_tailored_cv_url_key` is the race
 * backstop after we canonicalize the URL on write.
 */
async function isTailoredCvUrlInUse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  cvUrl: string,
  excludeApplicationId?: string,
): Promise<{ inUse: boolean; error: string | null }> {
  const targetKey = getCvObjectKeyFromPublicUrl(cvUrl);
  if (!targetKey) {
    return { inUse: true, error: "Invalid tailored CV URL" };
  }

  let query = supabase
    .from("applications")
    .select("id, cv_url")
    .eq("user_id", userId)
    .eq("cv_type", "tailored");

  if (excludeApplicationId) {
    query = query.neq("id", excludeApplicationId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("isTailoredCvUrlInUse:", error);
    return { inUse: true, error: error.message };
  }
  const inUse = (data ?? []).some(
    (row) => getCvObjectKeyFromPublicUrl(row.cv_url) === targetKey,
  );
  return { inUse, error: null };
}

function invalidTailoredCvResponse() {
  return NextResponse.json(
    { error: "CV URL must be a tailored upload you created for this application" },
    { status: 400 },
  );
}

function tailoredCvInUseResponse() {
  return NextResponse.json(
    { error: "This tailored CV is already used by another application" },
    { status: 409 },
  );
}

/** Map Postgres unique violations to stable 409 responses (slug vs tailored cv_url). */
function applicationsUniqueViolationResponse(error: {
  code?: string;
  message?: string;
}): NextResponse | null {
  if (error.code !== "23505") return null;
  const message = error.message ?? "";
  if (
    message.includes("applications_user_id_tailored_cv_url_key") ||
    message.includes("tailored_cv_url")
  ) {
    return tailoredCvInUseResponse();
  }
  return NextResponse.json(
    { error: SLUG_COLLISION_USER_MESSAGE },
    { status: 409 },
  );
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw: unknown = await request.json();
    const parsed = applicationCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatApplicationCreateZodError(parsed.error) },
        { status: 400 },
      );
    }
    const body = parsed.data;

    // Same helper as POST /api/slug/validate — closes races between client
    // validate/reserve and this create. UNIQUE (user_id, slug) remains the
    // final backstop (mapped to 409 below).
    const slugCheck = await validateSlugForApplication(body.slug, user.id);
    if (!slugCheck.ok) {
      const status =
        slugCheck.error === SLUG_COLLISION_USER_MESSAGE ? 409 : 400;
      return NextResponse.json({ error: slugCheck.error }, { status });
    }

    const supabase = await createClient();
    await ensureProfilePublicId(supabase, user);
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

    const cvType: ApplicationCvType =
      body.cv_type === "primary" ? "primary" : "tailored";
    let cvUrl = body.cv_url;
    let cvFilename = body.cv_filename ?? null;
    let primaryCvId: string | null = null;

    if (cvType === "primary") {
      if (!body.primary_cv_id) {
        return NextResponse.json(
          { error: "primary_cv_id is required when cv_type is primary" },
          { status: 400 },
        );
      }
      const primary = await resolvePrimaryCvForUser(
        supabase,
        user.id,
        body.primary_cv_id,
      );
      if (!primary) {
        return NextResponse.json(
          { error: "Primary CV not found" },
          { status: 400 },
        );
      }
      cvUrl = primary.url;
      cvFilename = primary.filename;
      primaryCvId = body.primary_cv_id;
    } else {
      const canonical = toCanonicalCvPublicUrl(cvUrl);
      if (!canonical || !isOwnedTailoredCvUrl(canonical, user.id)) {
        return invalidTailoredCvResponse();
      }
      cvUrl = canonical;
      const usage = await isTailoredCvUrlInUse(supabase, user.id, cvUrl);
      if (usage.error) {
        // Invalid URL after ownership check is a client error; DB failures → 500.
        const status = usage.error === "Invalid tailored CV URL" ? 400 : 500;
        return NextResponse.json({ error: usage.error }, { status });
      }
      if (usage.inUse) {
        return tailoredCvInUseResponse();
      }
    }

    const status: ApplicationStatus = body.status ?? "active";

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
        cv_type: cvType,
        primary_cv_id: primaryCvId,
      })
      .select()
      .single();

    if (error) {
      // UNIQUE (user_id, slug) or tailored cv_url — race after pre-checks.
      const uniqueResponse = applicationsUniqueViolationResponse(error);
      if (uniqueResponse) return uniqueResponse;
      console.error("POST /api/applications:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw: unknown = await request.json();
    const parsed = applicationUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatApplicationUpdateZodError(parsed.error) },
        { status: 400 },
      );
    }
    const body = parsed.data;
    const { id } = body;

    if (body.slug !== undefined) {
      const slugCheck = await validateSlugForApplication(
        body.slug,
        user.id,
        id,
      );
      if (!slugCheck.ok) {
        const status =
          slugCheck.error === SLUG_COLLISION_USER_MESSAGE ? 409 : 400;
        return NextResponse.json({ error: slugCheck.error }, { status });
      }
    }

    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {};
    if (body.company !== undefined) updatePayload.company = body.company;
    if (body.role !== undefined) updatePayload.role = body.role;
    if (body.slug !== undefined) updatePayload.slug = body.slug;
    if (body.video_url !== undefined) updatePayload.video_url = body.video_url;
    if (body.first_name !== undefined) updatePayload.first_name = body.first_name;
    if (body.last_name !== undefined) updatePayload.last_name = body.last_name;
    if (body.location !== undefined) updatePayload.location = body.location;
    if (body.portfolio_url !== undefined) {
      updatePayload.portfolio_url = body.portfolio_url;
    }
    if (body.linkedin_url !== undefined) {
      updatePayload.linkedin_url = body.linkedin_url;
    }
    if (body.use_original_cv_filename !== undefined) {
      updatePayload.use_original_cv_filename = body.use_original_cv_filename;
    }
    if (body.slugNamePosition !== undefined) {
      updatePayload.include_name_in_slug = body.slugNamePosition;
    }
    if (body.show_profile_picture !== undefined) {
      updatePayload.show_profile_picture = body.show_profile_picture === true;
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("user_id, cv_url, cv_type, status")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    if (body.status !== undefined) {
      updatePayload.status = body.status;
      if (body.status === "archived") {
        updatePayload.archived_at = new Date().toISOString();
      } else {
        updatePayload.archived_at = null;
      }
    }

    const cvFieldsTouched =
      body.cv_type !== undefined ||
      body.primary_cv_id !== undefined ||
      body.cv_url !== undefined ||
      body.cv_filename !== undefined;

    /** Old tailored object to delete only after a successful DB update. */
    let previousCvToDelete: {
      url: string;
      cvType: ApplicationCvType;
    } | null = null;

    if (cvFieldsTouched) {
      let nextCvType: ApplicationCvType =
        (existing.cv_type as ApplicationCvType) ?? "tailored";

      if (body.cv_type !== undefined) {
        updatePayload.cv_type = body.cv_type;
        nextCvType = body.cv_type;
      }

      let nextCvUrl = existing.cv_url as string;

      if (nextCvType === "primary") {
        const primaryId = body.primary_cv_id ?? null;
        if (!primaryId) {
          return NextResponse.json(
            { error: "primary_cv_id is required when cv_type is primary" },
            { status: 400 },
          );
        }
        const primary = await resolvePrimaryCvForUser(
          supabase,
          user.id,
          primaryId,
        );
        if (!primary) {
          return NextResponse.json(
            { error: "Primary CV not found" },
            { status: 400 },
          );
        }
        nextCvUrl = primary.url;
        updatePayload.cv_url = primary.url;
        updatePayload.cv_filename = primary.filename;
        updatePayload.primary_cv_id = primaryId;
        updatePayload.cv_type = "primary";
      } else {
        if (body.cv_url !== undefined) {
          nextCvUrl = body.cv_url;
        }
        if (body.cv_filename !== undefined) {
          updatePayload.cv_filename = body.cv_filename;
        }
        updatePayload.primary_cv_id = null;
        updatePayload.cv_type = "tailored";

        const canonical = toCanonicalCvPublicUrl(nextCvUrl);
        if (!canonical || !isOwnedTailoredCvUrl(canonical, user.id)) {
          return invalidTailoredCvResponse();
        }
        nextCvUrl = canonical;
        updatePayload.cv_url = canonical;

        const usage = await isTailoredCvUrlInUse(
          supabase,
          user.id,
          nextCvUrl,
          id,
        );
        if (usage.error) {
          const status = usage.error === "Invalid tailored CV URL" ? 400 : 500;
          return NextResponse.json({ error: usage.error }, { status });
        }
        if (usage.inUse) {
          return tailoredCvInUseResponse();
        }
      }

      const previousKey = getCvObjectKeyFromPublicUrl(existing.cv_url);
      const nextKey = getCvObjectKeyFromPublicUrl(nextCvUrl);
      if (previousKey !== nextKey) {
        previousCvToDelete = {
          url: existing.cv_url,
          cvType: (existing.cv_type as ApplicationCvType) ?? "tailored",
        };
      }
    }

    const { data, error } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const uniqueResponse = applicationsUniqueViolationResponse(error);
      if (uniqueResponse) return uniqueResponse;
      console.error("PUT /api/applications:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (previousCvToDelete) {
      // Best-effort: row already points at the new URL; do not fail the request
      // if the old tailored object cannot be removed.
      await deleteApplicationCvIfTailored(
        previousCvToDelete.url,
        previousCvToDelete.cvType,
        user.id,
        { onError: "log" },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT /api/applications:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const rawId = searchParams.get("id");

    if (!rawId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    const idParsed = z.uuid({ error: "Application ID must be a valid UUID" }).safeParse(
      rawId.trim(),
    );
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Application ID must be a valid UUID" },
        { status: 400 },
      );
    }
    const id = idParsed.data;

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("applications")
      .select("user_id, cv_url, cv_type")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 },
      );
    }

    try {
      await deleteApplicationCvIfTailored(
        existing.cv_url,
        existing.cv_type as ApplicationCvType,
        user.id,
      );
    } catch (error) {
      console.error("DELETE /api/applications R2 cleanup:", error);
      return NextResponse.json(
        { error: "Failed to delete CV file. Please try again." },
        { status: 500 },
      );
    }

    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/applications:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}
