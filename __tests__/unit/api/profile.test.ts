/**
 * Tests for /api/profile — flow #3 (Profile read and update).
 *
 * GET  — returns existing profile; auto-creates one on first visit; handles
 *        DB errors and unauthenticated requests.
 * PUT  — upserts profile, validates URL fields, enforces rate limiting, and
 *        rejects unauthenticated callers.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks — declared with vi.hoisted so they are available when vi.mock
// factories are executed (vi.mock is hoisted to the top of the file).
// ---------------------------------------------------------------------------
const {
  mockRequireAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockDeleteProfilePicture,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockDeleteProfilePicture: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mockRequireAuth }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mockCreateClient }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  DEFAULT_API_RATE_LIMIT: { limit: 60, windowMs: 60_000 },
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
}));
vi.mock("@/lib/utils/profile-picture-storage", () => ({
  deleteProfilePictureIfOurs: mockDeleteProfilePicture,
}));

import { GET, PUT } from "@/app/api/profile/route";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const MOCK_USER = { id: "user-123" };
const EXISTING_PROFILE = {
  user_id: "user-123",
  first_name: "Jane",
  last_name: "Doe",
  location: "Stockholm",
  portfolio_url: null,
  linkedin_url: null,
  profile_picture_url: null,
};

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost/api/profile", { method: "GET" });
}

function makePutRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/profile", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: authenticated user
  mockRequireAuth.mockResolvedValue(MOCK_USER);
  // Default: rate limit not exceeded
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
});

// ---------------------------------------------------------------------------
// GET /api/profile
// ---------------------------------------------------------------------------
describe("GET /api/profile", () => {
  it("returns 200 with the existing profile", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_PROFILE)]),
    );

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ user_id: "user-123", first_name: "Jane" });
  });

  it("creates and returns a new profile row when none exists (PGRST116)", async () => {
    const newProfile = { user_id: "user-123", first_name: null };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        dbError("No rows found", "PGRST116"), // first select: no profile
        ok(newProfile),                        // insert: returns new profile
      ]),
    );

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ user_id: "user-123" });
  });

  it("returns 400 when the insert after PGRST116 fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        dbError("No rows found", "PGRST116"),
        dbError("Insert failed"),
      ]),
    );

    const response = await GET();
    expect(response.status).toBe(400);
  });

  it("returns 500 for unexpected DB errors", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("Internal DB error")]),
    );

    const response = await GET();
    expect(response.status).toBe(500);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });
});

// ---------------------------------------------------------------------------
// PUT /api/profile
// ---------------------------------------------------------------------------
describe("PUT /api/profile", () => {
  it("returns 200 with updated profile data on success", async () => {
    const updatedProfile = { ...EXISTING_PROFILE, first_name: "Updated" };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(EXISTING_PROFILE), // select existing
        ok(updatedProfile),   // upsert result
        ok(null),             // applications sync (update)
      ]),
    );

    const response = await PUT(
      makePutRequest({ first_name: "Updated" }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ first_name: "Updated" });
  });

  it("returns 400 for an invalid portfolio URL", async () => {
    // No DB call should happen — validation is synchronous
    const response = await PUT(
      makePutRequest({ portfolio_url: "not-a-url" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Portfolio URL");
  });

  it("returns 400 for an invalid LinkedIn URL", async () => {
    const response = await PUT(
      makePutRequest({ linkedin_url: "ftp://example.com" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("LinkedIn URL");
  });

  it("accepts valid http and https URLs", async () => {
    const updatedProfile = { ...EXISTING_PROFILE };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_PROFILE), ok(updatedProfile), ok(null)]),
    );

    const response = await PUT(
      makePutRequest({
        portfolio_url: "https://johndoe.dev",
        linkedin_url: "http://linkedin.com/in/johndoe",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("accepts null or empty-string URLs (field cleared)", async () => {
    const updatedProfile = { ...EXISTING_PROFILE, portfolio_url: null };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_PROFILE), ok(updatedProfile), ok(null)]),
    );

    const response = await PUT(
      makePutRequest({ portfolio_url: null }),
    );
    expect(response.status).toBe(200);
  });

  it("returns 400 when the upsert fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(EXISTING_PROFILE),      // select existing
        dbError("Upsert failed"),  // upsert fails
      ]),
    );

    const response = await PUT(makePutRequest({ first_name: "X" }));
    expect(response.status).toBe(400);
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await PUT(makePutRequest({ first_name: "X" }));
    expect(response.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await PUT(makePutRequest({ first_name: "X" }));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("calls deleteProfilePicture when the picture URL changes", async () => {
    const existingWithPicture = {
      ...EXISTING_PROFILE,
      profile_picture_url: "https://r2.example.com/old.jpg",
    };
    const updatedProfile = {
      ...existingWithPicture,
      profile_picture_url: "https://r2.example.com/new.jpg",
    };
    mockDeleteProfilePicture.mockResolvedValue(undefined);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(existingWithPicture),
        ok(updatedProfile),
        ok(null),
      ]),
    );

    await PUT(
      makePutRequest({
        profile_picture_url: "https://r2.example.com/new.jpg",
      }),
    );

    expect(mockDeleteProfilePicture).toHaveBeenCalledOnce();
  });
});
