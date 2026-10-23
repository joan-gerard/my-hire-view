import { withAuth } from "@/lib/api/with-auth";
import {
  checkRateLimit,
  DEFAULT_API_RATE_LIMIT,
  rateLimit429,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationDashboardCounts } from "@/lib/types/application";
import { NextRequest, NextResponse } from "next/server";

/**
 * One lightweight query of `status` only — no profile lookup, no R2 HeadObject.
 * Aggregates a single snapshot for the dashboard summary rail.
 */
export async function GET(request: NextRequest) {
  const rate = await checkRateLimit(request, DEFAULT_API_RATE_LIMIT);
  if (!rate.success) return rateLimit429(rate);

  const auth = await withAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("applications")
      .select("status")
      .eq("user_id", user.id);

    if (error) {
      console.error("GET /api/applications/counts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts: ApplicationDashboardCounts = {
      all: 0,
      active: 0,
      draft: 0,
      archived: 0,
    };

    for (const row of data ?? []) {
      counts.all += 1;
      if (row.status === "active") counts.active += 1;
      else if (row.status === "draft") counts.draft += 1;
      else if (row.status === "archived") counts.archived += 1;
    }

    return NextResponse.json({ data: counts });
  } catch (err) {
    console.error("GET /api/applications/counts:", err);
    return NextResponse.json(
      { error: "Failed to fetch application counts" },
      { status: 500 },
    );
  }
}
