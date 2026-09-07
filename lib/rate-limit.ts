import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";
import { isValidPublicId } from "@/lib/utils/public-id";
import { validateSlugFormat } from "@/lib/utils/slug-generate";

/**
 * Extracts a best-effort client identifier for rate limiting.
 * Prefers IP from x-forwarded-for (first entry) or x-real-ip; falls back to "unknown".
 * On Vercel/proxies, x-forwarded-for is typically set; locally you may see 127.0.0.1.
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Next.js 15+ may set request.ip in some runtimes
  const ip = (request as NextRequest & { ip?: string }).ip;
  if (ip) return ip;
  return "unknown";
}

type WindowEntry = { count: number; windowEnd: number };

const store = new Map<string, WindowEntry>();

/** Soft cap for the in-memory fallback store (D3-001 Map growth). */
const MEMORY_STORE_MAX_KEYS = 10_000;
const MEMORY_SWEEP_INTERVAL_MS = 60_000;
let lastMemorySweepAt = 0;
let missingRedisWarned = false;

/** Removes expired entries to avoid unbounded growth (e.g. in long-running dev server). */
function prune(key: string, now: number): void {
  const entry = store.get(key);
  if (entry && now >= entry.windowEnd) store.delete(key);
}

/**
 * Periodically drop expired keys; if still over capacity, evict soonest-to-expire
 * entries so unique junk paths cannot grow the Map without bound (D3-001).
 */
function sweepMemoryStore(now: number): void {
  const due =
    now - lastMemorySweepAt >= MEMORY_SWEEP_INTERVAL_MS ||
    store.size >= MEMORY_STORE_MAX_KEYS;
  if (!due) return;
  lastMemorySweepAt = now;

  for (const [key, entry] of store) {
    if (now >= entry.windowEnd) store.delete(key);
  }

  if (store.size < MEMORY_STORE_MAX_KEYS) return;

  const ordered = [...store.entries()].sort(
    (a, b) => a[1].windowEnd - b[1].windowEnd,
  );
  const target = Math.floor(MEMORY_STORE_MAX_KEYS * 0.8);
  const toDrop = store.size - target;
  for (let i = 0; i < toDrop; i++) {
    store.delete(ordered[i]![0]);
  }
}

export interface RateLimitOptions {
  /** Max number of requests allowed in the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
  /**
   * Optional prefix so this limit does not share a counter with other
   * `checkRateLimit` callers for the same IP (e.g. `slug-validate`).
   */
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

type UpstashDuration = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

function windowMsToDuration(windowMs: number): UpstashDuration {
  if (windowMs % 86_400_000 === 0) return `${windowMs / 86_400_000} d`;
  if (windowMs % 3_600_000 === 0) return `${windowMs / 3_600_000} h`;
  if (windowMs % 60_000 === 0) return `${windowMs / 60_000} m`;
  if (windowMs % 1_000 === 0) return `${windowMs / 1_000} s`;
  return `${windowMs} ms`;
}

function hasUpstashEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

let redisClient: Redis | null | undefined;
const limiterCache = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  if (!hasUpstashEnv()) {
    redisClient = null;
    if (
      !missingRedisWarned &&
      process.env.NODE_ENV === "production" &&
      process.env.VERCEL_ENV === "production"
    ) {
      missingRedisWarned = true;
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN unset; using in-memory limits (not shared across instances).",
      );
    }
    return null;
  }
  try {
    redisClient = Redis.fromEnv();
    return redisClient;
  } catch (err) {
    console.error("[rate-limit] Failed to init Upstash Redis; using in-memory", err);
    redisClient = null;
    return null;
  }
}

function getUpstashLimiter(options: RateLimitOptions): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${options.limit}:${options.windowMs}:${options.keyPrefix ?? ""}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(
        options.limit,
        windowMsToDuration(options.windowMs),
      ),
      prefix: `mhv:${options.keyPrefix ?? "rl"}`,
      analytics: false,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * In-memory fixed-window rate limiter (local/dev fallback and when Redis is unset).
 * Prefer {@link rateLimitAsync} / {@link checkRateLimit} in request handlers so
 * production can use shared Upstash counters across serverless instances (D3-001).
 */
export function rateLimit(
  options: RateLimitOptions,
  identifier: string,
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();
  sweepMemoryStore(now);
  prune(identifier, now);

  let entry = store.get(identifier);
  if (!entry || now >= entry.windowEnd) {
    entry = { count: 1, windowEnd: now + windowMs };
    store.set(identifier, entry);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: entry.windowEnd,
    };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;
  return {
    success,
    remaining,
    resetAt: entry.windowEnd,
  };
}

/**
 * Durable when Upstash env is set; otherwise in-memory (per instance).
 * On Redis errors, falls back to in-memory so an outage does not take routes down.
 */
export async function rateLimitAsync(
  options: RateLimitOptions,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(options);
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch (err) {
      console.error(
        "[rate-limit] Upstash limit failed; falling back to in-memory",
        err,
      );
    }
  }
  return rateLimit(options, identifier);
}

/** Default for general API write routes: 60 requests per minute per IP. */
export const DEFAULT_API_RATE_LIMIT: RateLimitOptions = {
  limit: 60,
  windowMs: 60_000,
};

/**
 * View/download count increments: stricter cap per IP per application path.
 * Complements the default per-IP limit so one client cannot inflate a single
 * application's analytics as aggressively.
 */
export const ANALYTICS_PER_SLUG_RATE_LIMIT: RateLimitOptions = {
  limit: 10,
  windowMs: 60_000,
  keyPrefix: "analytics-path",
};

/**
 * POST /api/slug/validate — tighter than general writes.
 * Debounced UI (~450ms) still fits; caps abuse from rapid manual slug edits.
 * Namespaced so other `checkRateLimit` callers do not share this counter (D2-034).
 */
export const SLUG_VALIDATE_RATE_LIMIT: RateLimitOptions = {
  limit: 30,
  windowMs: 60_000,
  keyPrefix: "slug-validate",
};

/** CV PDF upload: stricter than general writes (per IP and per user). */
export const CV_UPLOAD_RATE_LIMIT: RateLimitOptions = {
  limit: 10,
  windowMs: 60_000,
};

/** Best-effort in-flight upload cap per user (per server instance). */
const MAX_CONCURRENT_CV_UPLOADS_PER_USER = 2;
const uploadInFlight = new Map<string, number>();

/**
 * Tries to reserve a concurrent CV-upload slot for `userId`.
 * Call `releaseUserUploadSlot` in a `finally` when the request finishes.
 */
export function tryAcquireUserUploadSlot(userId: string): boolean {
  const n = uploadInFlight.get(userId) ?? 0;
  if (n >= MAX_CONCURRENT_CV_UPLOADS_PER_USER) return false;
  uploadInFlight.set(userId, n + 1);
  return true;
}

export function releaseUserUploadSlot(userId: string): void {
  const n = (uploadInFlight.get(userId) ?? 1) - 1;
  if (n <= 0) uploadInFlight.delete(userId);
  else uploadInFlight.set(userId, n);
}

/**
 * Convenience: rate limit by request IP (optionally namespaced via
 * `options.keyPrefix`) and return a result the caller can turn into 429.
 */
export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const ip = getClientIdentifier(request);
  const id = options.keyPrefix ? `${options.keyPrefix}:${ip}` : ip;
  return rateLimitAsync(options, id);
}

/**
 * Rate limit by IP + public application path (`publicId`/`slug`).
 * Use after the default per-IP check for view/download analytics routes.
 *
 * Invalid `publicId` / slug formats do not create a per-path key (D3-001): the
 * caller still has the IP-level limit, and junk URLs cannot grow the store.
 */
export async function checkPerSlugRateLimit(
  request: NextRequest,
  publicId: string,
  slug: string,
  options: RateLimitOptions = ANALYTICS_PER_SLUG_RATE_LIMIT,
): Promise<RateLimitResult> {
  if (!isValidPublicId(publicId) || !validateSlugFormat(slug).ok) {
    return {
      success: true,
      remaining: options.limit,
      resetAt: Date.now() + options.windowMs,
    };
  }

  const ip = getClientIdentifier(request);
  return rateLimitAsync(options, `${ip}:${publicId}:${slug}`);
}

/**
 * Returns a 429 JSON response with Retry-After header.
 * Use when checkRateLimit(...).success is false.
 */
export function rateLimit429(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfter)) },
    },
  );
}

/** Test helper: size of the in-memory fallback store. */
export function getMemoryRateLimitStoreSizeForTests(): number {
  return store.size;
}

/** Test helper: clear Redis client / limiter caches between cases. */
export function resetRateLimitClientsForTests(): void {
  redisClient = undefined;
  limiterCache.clear();
  missingRedisWarned = false;
  store.clear();
  lastMemorySweepAt = 0;
}
