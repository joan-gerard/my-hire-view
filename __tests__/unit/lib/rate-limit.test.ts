import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  getClientIdentifier,
  rateLimit,
  checkRateLimit,
  rateLimit429,
  type RateLimitOptions,
} from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/test", { headers });
}

// The rate-limit module keeps an in-memory store. Reset it between tests by
// using a unique identifier per test so state never bleeds across test cases.
let testId = 0;
function uniqueId(): string {
  return `test-client-${++testId}`;
}

const SMALL_LIMIT: RateLimitOptions = { limit: 3, windowMs: 60_000 };

// ---------------------------------------------------------------------------
// getClientIdentifier
// ---------------------------------------------------------------------------
describe("getClientIdentifier", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIdentifier(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = makeRequest({ "x-real-ip": "9.10.11.12" });
    expect(getClientIdentifier(req)).toBe("9.10.11.12");
  });

  it("returns 'unknown' when neither header is present", () => {
    const req = makeRequest();
    expect(getClientIdentifier(req)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// rateLimit
// ---------------------------------------------------------------------------
describe("rateLimit", () => {
  it("allows the first request and returns the correct remaining count", () => {
    const id = uniqueId();
    const result = rateLimit(SMALL_LIMIT, id);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(SMALL_LIMIT.limit - 1);
  });

  it("allows requests up to the limit", () => {
    const id = uniqueId();
    for (let i = 0; i < SMALL_LIMIT.limit; i++) {
      const result = rateLimit(SMALL_LIMIT, id);
      expect(result.success).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const id = uniqueId();
    for (let i = 0; i < SMALL_LIMIT.limit; i++) {
      rateLimit(SMALL_LIMIT, id);
    }
    const exceeded = rateLimit(SMALL_LIMIT, id);
    expect(exceeded.success).toBe(false);
    expect(exceeded.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    vi.useFakeTimers();
    const id = uniqueId();
    // Exhaust the limit
    for (let i = 0; i < SMALL_LIMIT.limit; i++) {
      rateLimit(SMALL_LIMIT, id);
    }
    expect(rateLimit(SMALL_LIMIT, id).success).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(SMALL_LIMIT.windowMs + 1);
    expect(rateLimit(SMALL_LIMIT, id).success).toBe(true);
    vi.useRealTimers();
  });

  it("tracks different identifiers independently", () => {
    const id1 = uniqueId();
    const id2 = uniqueId();
    for (let i = 0; i < SMALL_LIMIT.limit; i++) {
      rateLimit(SMALL_LIMIT, id1);
    }
    expect(rateLimit(SMALL_LIMIT, id1).success).toBe(false);
    // id2 has not been used — should still succeed
    expect(rateLimit(SMALL_LIMIT, id2).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit
// ---------------------------------------------------------------------------
describe("checkRateLimit", () => {
  it("uses the x-forwarded-for header as the client identifier", () => {
    const req = makeRequest({ "x-forwarded-for": "42.42.42.42" });
    // A fresh IP should succeed on the first call
    const result = checkRateLimit(req, SMALL_LIMIT);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// rateLimit429
// ---------------------------------------------------------------------------
describe("rateLimit429", () => {
  it("returns a 429 response", async () => {
    const result = {
      success: false as const,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    };
    const response = rateLimit429(result);
    expect(response.status).toBe(429);
  });

  it("includes a Retry-After header", async () => {
    const result = {
      success: false as const,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    };
    const response = rateLimit429(result);
    const retryAfter = response.headers.get("Retry-After");
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  it("returns at least 1 second in Retry-After even when resetAt is in the past", async () => {
    const result = {
      success: false as const,
      remaining: 0,
      resetAt: Date.now() - 5_000, // already past
    };
    const response = rateLimit429(result);
    const retryAfter = Number(response.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThanOrEqual(1);
  });
});
