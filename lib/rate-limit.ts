import { NextResponse, type NextRequest } from 'next/server';

/**
 * Extracts a best-effort client identifier for rate limiting.
 * Prefers IP from x-forwarded-for (first entry) or x-real-ip; falls back to "unknown".
 * On Vercel/proxies, x-forwarded-for is typically set; locally you may see 127.0.0.1.
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  // Next.js 15+ may set request.ip in some runtimes
  const ip = (request as NextRequest & { ip?: string }).ip;
  if (ip) return ip;
  return 'unknown';
}

type WindowEntry = { count: number; windowEnd: number };

const store = new Map<string, WindowEntry>();

/** Removes expired entries to avoid unbounded growth (e.g. in long-running dev server). */
function prune(key: string, now: number): void {
  const entry = store.get(key);
  if (entry && now >= entry.windowEnd) store.delete(key);
}

export interface RateLimitOptions {
  /** Max number of requests allowed in the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * In-memory fixed-window rate limiter.
 * Use a single identifier per client (e.g. IP or IP + email for stricter limits).
 *
 * Note: In serverless, state is per-instance; for strict cross-instance limits
 * consider Upstash Redis or similar.
 */
export function rateLimit(
  options: RateLimitOptions,
  identifier: string
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();
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
};

/**
 * POST /api/slug/validate — tighter than general writes.
 * Debounced UI (~450ms) still fits; caps abuse from rapid manual slug edits.
 */
export const SLUG_VALIDATE_RATE_LIMIT: RateLimitOptions = {
  limit: 30,
  windowMs: 60_000,
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

/** Convenience: rate limit by request IP and return 429 response if limited. */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  const id = getClientIdentifier(request);
  return rateLimit(options, id);
}

/**
 * Rate limit by IP + public application path (`publicId`/`slug`).
 * Use after the default per-IP check for view/download analytics routes.
 */
export function checkPerSlugRateLimit(
  request: NextRequest,
  publicId: string,
  slug: string,
  options: RateLimitOptions = ANALYTICS_PER_SLUG_RATE_LIMIT,
): RateLimitResult {
  const ip = getClientIdentifier(request);
  return rateLimit(options, `${ip}:${publicId}:${slug}`);
}

/**
 * Returns a 429 JSON response with Retry-After header.
 * Use when checkRateLimit(...).success is false.
 */
export function rateLimit429(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(1, retryAfter)) },
    }
  );
}
