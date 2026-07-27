import { requireAuth } from "@/lib/auth";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import { validateSlugForApplication } from "@/lib/utils/slug";
import { NextRequest, NextResponse } from "next/server";

function sanitizeExcludeId(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const s = raw.trim();
  if (!s || s.length > 64) return undefined;
  return s;
}

/**
 * Check whether a proposed application slug is valid (format) and available (unique).
 * Requires auth. Optional excludeId ignores the current row when editing.
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
    const body = await request.json();
    const slug = typeof body.slug === "string" ? body.slug : "";
    const excludeId = sanitizeExcludeId(body.excludeId);

    const result = await validateSlugForApplication(slug, user.id, excludeId);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to validate slug" },
      { status: 500 },
    );
  }
}
