import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  getClientIdentifier,
  rateLimit,
  checkRateLimit,
  checkPerSlugRateLimit,
  rateLimit429,
  SLUG_VALIDATE_RATE_LIMIT,
  getMemoryRateLimitStoreSizeForTests,
  resetRateLimitClientsForTests,
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

beforeEach(() => {
  resetRateLimitClientsForTests();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.doUnmock("@upstash/redis");
  vi.doUnmock("@upstash/ratelimit");
  vi.resetModules();
  resetRateLimitClientsForTests();
});

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

  it("sweeps expired entries after the sweep interval", () => {
    vi.useFakeTimers();
    const shortWindow: RateLimitOptions = { limit: 2, windowMs: 1_000 };
    const expiredId = `expired-${uniqueId()}`;
    rateLimit(shortWindow, expiredId);
    expect(getMemoryRateLimitStoreSizeForTests()).toBeGreaterThanOrEqual(1);

    // Past both the entry window and MEMORY_SWEEP_INTERVAL_MS (60s)
    vi.advanceTimersByTime(61_000);
    rateLimit(shortWindow, `fresh-${uniqueId()}`);

    // Expired key removed by sweep; only the fresh key should remain from this pair
    // (other tests may have left nothing after reset in beforeEach)
    expect(getMemoryRateLimitStoreSizeForTests()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Concurrent upload slots
// ---------------------------------------------------------------------------
describe("tryAcquireUserUploadSlot / releaseUserUploadSlot", () => {
  it("allows up to two concurrent slots per user", async () => {
    const { tryAcquireUserUploadSlot, releaseUserUploadSlot } = await import(
      "@/lib/rate-limit"
    );
    const userId = `concurrent-user-${uniqueId()}`;
    expect(tryAcquireUserUploadSlot(userId)).toBe(true);
    expect(tryAcquireUserUploadSlot(userId)).toBe(true);
    expect(tryAcquireUserUploadSlot(userId)).toBe(false);
    releaseUserUploadSlot(userId);
    expect(tryAcquireUserUploadSlot(userId)).toBe(true);
    releaseUserUploadSlot(userId);
    releaseUserUploadSlot(userId);
  });

  it("tracks users independently", async () => {
    const { tryAcquireUserUploadSlot, releaseUserUploadSlot } = await import(
      "@/lib/rate-limit"
    );
    const a = `concurrent-a-${uniqueId()}`;
    const b = `concurrent-b-${uniqueId()}`;
    expect(tryAcquireUserUploadSlot(a)).toBe(true);
    expect(tryAcquireUserUploadSlot(a)).toBe(true);
    expect(tryAcquireUserUploadSlot(a)).toBe(false);
    expect(tryAcquireUserUploadSlot(b)).toBe(true);
    releaseUserUploadSlot(a);
    releaseUserUploadSlot(a);
    releaseUserUploadSlot(b);
  });
});

// ---------------------------------------------------------------------------
// checkPerSlugRateLimit
// ---------------------------------------------------------------------------
describe("checkPerSlugRateLimit", () => {
  it("keys by IP and application path so different slugs stay independent", async () => {
    const req = makeRequest({ "x-forwarded-for": `slug-ip-${uniqueId()}` });
    const tight = { limit: 2, windowMs: 60_000 };

    expect(
      (await checkPerSlugRateLimit(req, "abc12345", "app-one", tight)).success,
    ).toBe(true);
    expect(
      (await checkPerSlugRateLimit(req, "abc12345", "app-one", tight)).success,
    ).toBe(true);
    expect(
      (await checkPerSlugRateLimit(req, "abc12345", "app-one", tight)).success,
    ).toBe(false);
    // Different slug under the same IP still allowed
    expect(
      (await checkPerSlugRateLimit(req, "abc12345", "app-two", tight)).success,
    ).toBe(true);
  });

  it("does not create store keys for invalid publicId/slug (D3-001)", async () => {
    const req = makeRequest({ "x-forwarded-for": `junk-ip-${uniqueId()}` });
    const before = getMemoryRateLimitStoreSizeForTests();

    for (let i = 0; i < 50; i++) {
      const result = await checkPerSlugRateLimit(
        req,
        `!!!invalid-${i}!!!`,
        `also bad ${i}`,
        { limit: 2, windowMs: 60_000 },
      );
      expect(result.success).toBe(true);
    }

    expect(getMemoryRateLimitStoreSizeForTests()).toBe(before);

    // Valid path still has a fresh allowance
    const valid = await checkPerSlugRateLimit(req, "abc12345", "app-one", {
      limit: 2,
      windowMs: 60_000,
    });
    expect(valid.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit
// ---------------------------------------------------------------------------
describe("checkRateLimit", () => {
  it("uses the x-forwarded-for header as the client identifier", async () => {
    const req = makeRequest({ "x-forwarded-for": "42.42.42.42" });
    // A fresh IP should succeed on the first call
    const result = await checkRateLimit(req, SMALL_LIMIT);
    expect(result.success).toBe(true);
  });

  it("namespaces counters when keyPrefix is set (D2-034)", async () => {
    const ip = `prefix-ip-${uniqueId()}`;
    const req = makeRequest({ "x-forwarded-for": ip });
    const tight: RateLimitOptions = {
      limit: 2,
      windowMs: 60_000,
      keyPrefix: "slug-validate",
    };
    const bare: RateLimitOptions = { limit: 2, windowMs: 60_000 };

    expect((await checkRateLimit(req, tight)).success).toBe(true);
    expect((await checkRateLimit(req, tight)).success).toBe(true);
    expect((await checkRateLimit(req, tight)).success).toBe(false);
    // Same IP without prefix still has its own allowance
    expect((await checkRateLimit(req, bare)).success).toBe(true);
  });

  it("keeps SLUG_VALIDATE_RATE_LIMIT independent of DEFAULT-style IP buckets", async () => {
    const ip = `slug-validate-ip-${uniqueId()}`;
    const req = makeRequest({ "x-forwarded-for": ip });
    const general: RateLimitOptions = { limit: 2, windowMs: 60_000 };

    expect((await checkRateLimit(req, general)).success).toBe(true);
    expect((await checkRateLimit(req, general)).success).toBe(true);
    expect((await checkRateLimit(req, general)).success).toBe(false);
    // Slug validate still allowed — does not share the bare-IP counter
    expect((await checkRateLimit(req, SLUG_VALIDATE_RATE_LIMIT)).success).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// Upstash path (mocked)
// ---------------------------------------------------------------------------
describe("Upstash-backed rateLimitAsync", () => {
  it("uses Upstash when REST env vars are set", async () => {
    const limitFn = vi.fn().mockResolvedValue({
      success: true,
      remaining: 5,
      reset: Date.now() + 60_000,
    });

    vi.resetModules();
    vi.doMock("@upstash/redis", () => ({
      Redis: {
        fromEnv: () => ({}),
      },
    }));
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        static fixedWindow = vi.fn(() => ({}));
        limit = limitFn;
      },
    }));

    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");

    const { rateLimitAsync, resetRateLimitClientsForTests: reset } =
      await import("@/lib/rate-limit");
    reset();

    const result = await rateLimitAsync(SMALL_LIMIT, `upstash-${uniqueId()}`);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(5);
    expect(limitFn).toHaveBeenCalledTimes(1);
  });

  it("falls back to in-memory when Upstash.limit throws", async () => {
    const limitFn = vi.fn().mockRejectedValue(new Error("redis down"));

    vi.resetModules();
    vi.doMock("@upstash/redis", () => ({
      Redis: {
        fromEnv: () => ({}),
      },
    }));
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        static fixedWindow = vi.fn(() => ({}));
        limit = limitFn;
      },
    }));

    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");

    const { rateLimitAsync, resetRateLimitClientsForTests: reset } =
      await import("@/lib/rate-limit");
    reset();

    const id = `fallback-${uniqueId()}`;
    const first = await rateLimitAsync({ limit: 1, windowMs: 60_000 }, id);
    const second = await rateLimitAsync({ limit: 1, windowMs: 60_000 }, id);
    expect(first.success).toBe(true);
    expect(second.success).toBe(false);
    expect(limitFn).toHaveBeenCalled();
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
