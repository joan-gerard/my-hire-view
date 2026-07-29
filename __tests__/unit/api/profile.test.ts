/**
 * Tests for /api/profile — flow #3 (Profile read and update).
 *
 * GET  — returns existing profile or 404 when missing (read-only; no insert),
 *        enforces rate limiting, rejects unauthenticated callers.
 * PUT  — upserts profile (creates on first save), syncs Auth user_metadata names,
 *        validates URL fields, enforces rate limiting, rejects unauthenticated callers.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

const MOCK_USER = { id: "user-123" };
const EXISTING_PROFILE = {
  user_id: "user-123",
  public_id: "k7x2m9ab",
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
  mockRequireAuth.mockResolvedValue(MOCK_USER);
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
});

describe("GET /api/profile", () => {
  it("returns 200 with the existing profile", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_PROFILE)]),
    );

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ user_id: "user-123", first_name: "Jane" });
  });

  it("returns 404 when no profile row exists (PGRST116)", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("No rows found", "PGRST116")]),
    );

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe("Profile not found");
  });

  it("returns 500 for unexpected DB errors", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("Internal DB error")]),
    );

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Internal DB error");
  });

  it("returns 500 when an unexpected error is thrown after auth", async () => {
    mockCreateClient.mockRejectedValue(new Error("client boom"));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to fetch profile");
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });
});

describe("PUT /api/profile", () => {
  it("returns 200 with updated profile data on success", async () => {
    const updatedProfile = { ...EXISTING_PROFILE, first_name: "Updated" };
    const client = makeSupabaseClient([
      ok(EXISTING_PROFILE),
      ok(updatedProfile),
      ok(null),
    ]);
    mockCreateClient.mockResolvedValue(client);

    const response = await PUT(makePutRequest({ first_name: "Updated" }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ first_name: "Updated" });
    expect(client.auth.updateUser).toHaveBeenCalledWith({
      data: {
        first_name: "Updated",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    });
  });

  it("creates a profile on first PUT when none exists and syncs metadata", async () => {
    const created = {
      user_id: "user-123",
      first_name: "Jane",
      last_name: "Doe",
      location: null,
      portfolio_url: null,
      linkedin_url: null,
      profile_picture_url: null,
    };
    const client = makeSupabaseClient([
      dbError("No rows found", "PGRST116"),
      ok(created),
    ]);
    mockCreateClient.mockResolvedValue(client);

    const response = await PUT(
      makePutRequest({ first_name: "Jane", last_name: "Doe" }),
    );
    expect(response.status).toBe(200);
    expect(client.auth.updateUser).toHaveBeenCalledWith({
      data: expect.objectContaining({
        first_name: "Jane",
        last_name: "Doe",
        public_id: expect.stringMatching(/^[a-z0-9]{8}$/),
      }),
    });
  });

  it("returns 400 for an invalid portfolio URL", async () => {
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

    const response = await PUT(makePutRequest({ portfolio_url: null }));
    expect(response.status).toBe(200);
  });

  it("returns 400 when first or last name would be empty", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ ...EXISTING_PROFILE, first_name: "Jane", last_name: "Doe" }),
      ]),
    );

    const response = await PUT(
      makePutRequest({ first_name: "  ", last_name: "Doe" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("First name and last name");
  });

  it("returns 400 when the upsert fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(EXISTING_PROFILE),
        dbError("Upsert failed"),
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
