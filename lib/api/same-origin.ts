import type { NextRequest } from "next/server";
import { getBaseUrl } from "@/lib/utils/url";

/**
 * Origins allowed for public analytics POSTs (view / download counts).
 * Includes the request host (works on Vercel previews) and configured site URL.
 */
function allowedOriginsFor(request: NextRequest): Set<string> {
  const allowed = new Set<string>([request.nextUrl.origin]);
  try {
    allowed.add(new URL(getBaseUrl()).origin);
  } catch {
    // ignore invalid NEXT_PUBLIC_SITE_URL
  }
  return allowed;
}

/**
 * Best-effort same-origin gate for public analytics routes.
 * Accepts a matching `Origin`, a `Referer` whose origin is allowed, or
 * `Sec-Fetch-Site: same-origin`. Easy to forge with curl — defense in depth only.
 */
export function isSameOriginAnalyticsRequest(request: NextRequest): boolean {
  const allowed = allowedOriginsFor(request);

  const origin = request.headers.get("origin")?.trim();
  if (origin && allowed.has(origin)) {
    return true;
  }

  const referer = request.headers.get("referer")?.trim();
  if (referer) {
    try {
      if (allowed.has(new URL(referer).origin)) {
        return true;
      }
    } catch {
      // malformed Referer
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite === "same-origin") {
    return true;
  }

  return false;
}
