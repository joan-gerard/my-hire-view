import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { isSameOriginAnalyticsRequest } from "@/lib/api/same-origin";

function makeRequest(
  url: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, { method: "POST", headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isSameOriginAnalyticsRequest", () => {
  const apiUrl = "http://localhost:3000/api/applications/k7x2m9ab/volvo/view";

  it("accepts a matching Origin", () => {
    const req = makeRequest(apiUrl, { origin: "http://localhost:3000" });
    expect(isSameOriginAnalyticsRequest(req)).toBe(true);
  });

  it("accepts a Referer whose origin matches the request host", () => {
    const req = makeRequest(apiUrl, {
      referer: "http://localhost:3000/view/k7x2m9ab/volvo",
    });
    expect(isSameOriginAnalyticsRequest(req)).toBe(true);
  });

  it("accepts Sec-Fetch-Site: same-origin", () => {
    const req = makeRequest(apiUrl, { "sec-fetch-site": "same-origin" });
    expect(isSameOriginAnalyticsRequest(req)).toBe(true);
  });

  it("accepts Origin matching NEXT_PUBLIC_SITE_URL even if host differs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://myhireview.com");
    const req = makeRequest(
      "https://preview.vercel.app/api/applications/k7x2m9ab/volvo/view",
      { origin: "https://myhireview.com" },
    );
    expect(isSameOriginAnalyticsRequest(req)).toBe(true);
  });

  it("rejects a foreign Origin", () => {
    const req = makeRequest(apiUrl, { origin: "https://evil.example" });
    expect(isSameOriginAnalyticsRequest(req)).toBe(false);
  });

  it("rejects a Referer that only contains the site as a query string", () => {
    const req = makeRequest(apiUrl, {
      referer: "https://evil.example/?next=http://localhost:3000",
    });
    expect(isSameOriginAnalyticsRequest(req)).toBe(false);
  });

  it("rejects requests with no Origin, Referer, or Sec-Fetch-Site", () => {
    const req = makeRequest(apiUrl);
    expect(isSameOriginAnalyticsRequest(req)).toBe(false);
  });

  it("rejects a malformed Referer when Origin is absent", () => {
    const req = makeRequest(apiUrl, { referer: "not-a-url" });
    expect(isSameOriginAnalyticsRequest(req)).toBe(false);
  });
});
