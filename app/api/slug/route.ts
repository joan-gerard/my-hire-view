import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import { reserveBaseSlug, SlugCollisionError } from "@/lib/utils/slug";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns the slug derived from company/role (and name-in-URL rules) if available; 409 if already taken.
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  try {
    const {
      company,
      role,
      excludeId,
      first_name,
      last_name,
      slugNamePosition,
    } = await request.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: "Company and role are required" },
        { status: 400 },
      );
    }

    const position =
      slugNamePosition === "start" || slugNamePosition === "end"
        ? slugNamePosition
        : null;

    const slug = await reserveBaseSlug(
      company,
      role,
      excludeId,
      first_name ?? null,
      last_name ?? null,
      position,
    );
    return NextResponse.json({ slug });
  } catch (error) {
    if (error instanceof SlugCollisionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to generate slug" },
      { status: 500 },
    );
  }
}
