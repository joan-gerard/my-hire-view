import { requireAuth } from "@/lib/auth";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { reserveBaseSlug, SlugCollisionError } from "@/lib/utils/slug";
import {
  formatSlugReserveZodError,
  slugReserveSchema,
} from "@/lib/validation/slug";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns the slug derived from company/role (and name-in-URL rules) if available for this user; 409 if already taken.
 */
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
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = slugReserveSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatSlugReserveZodError(parsed.error) },
        { status: 400 },
      );
    }
    const body = parsed.data;

    if (body.excludeId) {
      const supabase = await createClient();
      const { data: owned, error: ownershipError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", body.excludeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (ownershipError) {
        console.error("POST /api/slug excludeId ownership:", ownershipError);
        return NextResponse.json(
          { error: "Failed to generate slug" },
          { status: 500 },
        );
      }
      if (!owned) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 },
        );
      }
    }

    const slug = await reserveBaseSlug(
      body.company,
      body.role,
      user.id,
      body.excludeId,
      body.first_name ?? null,
      body.last_name ?? null,
      body.slugNamePosition ?? null,
    );
    return NextResponse.json({ slug });
  } catch (error) {
    if (error instanceof SlugCollisionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("POST /api/slug:", error);
    return NextResponse.json(
      { error: "Failed to generate slug" },
      { status: 500 },
    );
  }
}
