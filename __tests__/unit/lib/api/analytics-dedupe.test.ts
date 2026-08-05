import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  ANALYTICS_DEDUPE_MAX_AGE_SEC,
  analyticsDedupeCookieName,
  hasAnalyticsDedupeCookie,
  setAnalyticsDedupeCookie,
} from "@/lib/api/analytics-dedupe";

const PUBLIC_ID = "k7x2m9ab";
const SLUG = "volvo-engineer";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("analyticsDedupeCookieName", () => {
  it("builds distinct names for view vs download", () => {
    expect(analyticsDedupeCookieName("view", PUBLIC_ID, SLUG)).toBe(
      `mhv_view_${PUBLIC_ID}_${SLUG}`,
    );
    expect(analyticsDedupeCookieName("download", PUBLIC_ID, SLUG)).toBe(
      `mhv_download_${PUBLIC_ID}_${SLUG}`,
    );
  });
});

describe("hasAnalyticsDedupeCookie", () => {
  it("returns true when the cookie value is 1", () => {
    const name = analyticsDedupeCookieName("view", PUBLIC_ID, SLUG);
    const request = new NextRequest("http://localhost/api/view", {
      headers: { cookie: `${name}=1` },
    });
    expect(hasAnalyticsDedupeCookie(request, "view", PUBLIC_ID, SLUG)).toBe(
      true,
    );
  });

  it("returns false when the cookie is missing or wrong", () => {
    const bare = new NextRequest("http://localhost/api/view");
    expect(hasAnalyticsDedupeCookie(bare, "view", PUBLIC_ID, SLUG)).toBe(
      false,
    );

    const name = analyticsDedupeCookieName("view", PUBLIC_ID, SLUG);
    const wrong = new NextRequest("http://localhost/api/view", {
      headers: { cookie: `${name}=0` },
    });
    expect(hasAnalyticsDedupeCookie(wrong, "view", PUBLIC_ID, SLUG)).toBe(
      false,
    );
  });
});

describe("setAnalyticsDedupeCookie", () => {
  it("sets an httpOnly cookie with the configured maxAge", () => {
    const response = NextResponse.json({ success: true });
    setAnalyticsDedupeCookie(response, "download", PUBLIC_ID, SLUG);

    const name = analyticsDedupeCookieName("download", PUBLIC_ID, SLUG);
    const cookie = response.cookies.get(name);
    expect(cookie?.value).toBe("1");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.path).toBe("/");
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.maxAge).toBe(ANALYTICS_DEDUPE_MAX_AGE_SEC);
  });

  it("sets secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = NextResponse.json({ success: true });
    setAnalyticsDedupeCookie(response, "view", PUBLIC_ID, SLUG);
    const cookie = response.cookies.get(
      analyticsDedupeCookieName("view", PUBLIC_ID, SLUG),
    );
    expect(cookie?.secure).toBe(true);
  });
});
