import { requireAuth } from "@/lib/auth";
import {
  checkRateLimit,
  rateLimit429,
  SLUG_VALIDATE_RATE_LIMIT,
} from "@/lib/rate-limit";
import { assertExcludeIdOwnedByUser } from "@/lib/utils/exclude-id-ownership";
import { validateSlugForApplication } from "@/lib/utils/slug";
import {
  formatSlugValidateZodError,
  slugValidateSchema,
} from "@/lib/validation/slug";
import { NextRequest, NextResponse } from "next/server";

/**
 * Check whether a proposed application slug is valid (format) and available (unique).
 * Requires auth. Optional excludeId ignores the current row when editing.
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, SLUG_VALIDATE_RATE_LIMIT);
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

    const parsed = slugValidateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatSlugValidateZodError(parsed.error) },
        { status: 400 },
      );
    }
    const body = parsed.data;

    if (body.excludeId) {
      const ownership = await assertExcludeIdOwnedByUser(
        body.excludeId,
        user.id,
      );
      if (!ownership.ok) {
        return NextResponse.json(
          { error: ownership.error },
          { status: ownership.status },
        );
      }
    }

    const result = await validateSlugForApplication(
      body.slug,
      user.id,
      body.excludeId,
    );
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 200 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/slug/validate:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to validate slug" },
      { status: 500 },
    );
  }
}
