import type { NextRequest, NextResponse } from "next/server";

/** How long a browser is treated as "already counted" for one application path. */
export const ANALYTICS_DEDUPE_MAX_AGE_SEC = 60 * 60 * 24; // 24 hours

export type AnalyticsDedupeKind = "view" | "download";

/**
 * Cookie name for server-side view/download dedupe.
 * Slugs are lowercase alphanumeric + hyphens; public ids are lowercase alphanumeric.
 */
export function analyticsDedupeCookieName(
  kind: AnalyticsDedupeKind,
  publicId: string,
  slug: string,
): string {
  return `mhv_${kind}_${publicId}_${slug}`;
}

/** True when the request already carries a valid dedupe cookie for this path. */
export function hasAnalyticsDedupeCookie(
  request: NextRequest,
  kind: AnalyticsDedupeKind,
  publicId: string,
  slug: string,
): boolean {
  const name = analyticsDedupeCookieName(kind, publicId, slug);
  return request.cookies.get(name)?.value === "1";
}

/**
 * Marks this browser as already counted for the path (httpOnly; not readable by JS).
 * Call after a successful ack (owner skip or RPC increment).
 */
export function setAnalyticsDedupeCookie(
  response: NextResponse,
  kind: AnalyticsDedupeKind,
  publicId: string,
  slug: string,
): void {
  response.cookies.set(analyticsDedupeCookieName(kind, publicId, slug), "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ANALYTICS_DEDUPE_MAX_AGE_SEC,
  });
}
