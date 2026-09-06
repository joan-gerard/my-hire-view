/**
 * Tests for /api/profile — flow #3 (Profile read and update).
 *
 * GET  — returns existing profile or 404 when missing (read-only; no insert),
 *        enforces rate limiting, rejects unauthenticated callers.
 * PUT  — upserts profile (creates on first save; seeds names/public_id from
 *        Auth metadata when the row is missing so picture-only first save works),
 *        syncs Auth user_metadata names, validates URL fields, enforces rate
 *        limiting, rejects unauthenticated callers.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
vi.mock("@/lib/utils/profile-picture-storage", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/utils/profile-picture-storage")>();
  return {
    ...actual,
    deleteProfilePictureIfOurs: mockDeleteProfilePicture,
  };
});

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
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
  mockRequireAuth.mockResolvedValue(MOCK_USER);
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
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

  it("creates profile from Auth metadata on picture-only first save (C3-026)", async () => {
    const ownedUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";
    mockRequireAuth.mockResolvedValue({
      id: "user-123",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    });
    const created = {
      user_id: "user-123",
      public_id: "k7x2m9ab",
      first_name: "Jane",
      last_name: "Doe",
      location: null,
      portfolio_url: null,
      linkedin_url: null,
      profile_picture_url: ownedUrl,
    };
    const upsertChain = ok(created);
    const client = makeSupabaseClient([
      dbError("No rows found", "PGRST116"),
      upsertChain,
    ]);
    mockCreateClient.mockResolvedValue(client);

    const response = await PUT(
      makePutRequest({ profile_picture_url: ownedUrl }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({
      first_name: "Jane",
      last_name: "Doe",
      public_id: "k7x2m9ab",
      profile_picture_url: ownedUrl,
    });
    expect(upsertChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
        profile_picture_url: ownedUrl,
      }),
      { onConflict: "user_id" },
    );
  });

  it("returns 400 on picture-only first save when Auth metadata has no names", async () => {
    const ownedUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";
    mockRequireAuth.mockResolvedValue({
      id: "user-123",
      user_metadata: { public_id: "k7x2m9ab" },
    });
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("No rows found", "PGRST116")]),
    );

    const response = await PUT(
      makePutRequest({ profile_picture_url: ownedUrl }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("First name and last name");
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

  it("returns 400 when first_name exceeds max length", async () => {
    const response = await PUT(
      makePutRequest({ first_name: "A".repeat(101) }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("First name");
    expect(json.error).toMatch(/100/);
  });

  it("returns 400 when location exceeds max length", async () => {
    const response = await PUT(
      makePutRequest({ location: "L".repeat(201) }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Location");
  });

  it("returns 400 for unexpected body keys", async () => {
    const response = await PUT(
      makePutRequest({ first_name: "Jane", public_id: "hacked" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/unrecognized key/i);
  });

  it("returns 400 when a field has the wrong type", async () => {
    const response = await PUT(makePutRequest({ first_name: 123 }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("First name");
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

    const response = await PUT(makePutRequest({ portfolio_url: "" }));
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

  it("returns 500 when an unexpected error is thrown after auth", async () => {
    mockCreateClient.mockRejectedValue(new Error("client boom"));

    const response = await PUT(makePutRequest({ first_name: "X" }));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to update profile");
  });

  it("calls deleteProfilePicture after a successful picture URL change", async () => {
    const oldUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";
    const newUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.png";
    const existingWithPicture = {
      ...EXISTING_PROFILE,
      profile_picture_url: oldUrl,
    };
    const updatedProfile = {
      ...existingWithPicture,
      profile_picture_url: newUrl,
    };
    mockDeleteProfilePicture.mockResolvedValue({ ok: true });
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(existingWithPicture),
        ok(updatedProfile),
        ok(null),
      ]),
    );

    const response = await PUT(
      makePutRequest({
        profile_picture_url: newUrl,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockDeleteProfilePicture).toHaveBeenCalledWith(
      expect.anything(),
      oldUrl,
    );
  });

  it("returns warnings when deleting the previous picture fails", async () => {
    const oldUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";
    const newUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.png";
    mockDeleteProfilePicture.mockResolvedValue({ ok: false });
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ ...EXISTING_PROFILE, profile_picture_url: oldUrl }),
        ok({ ...EXISTING_PROFILE, profile_picture_url: newUrl }),
        ok(null),
      ]),
    );

    const response = await PUT(
      makePutRequest({ profile_picture_url: newUrl }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.warnings?.[0]).toMatch(/failed to delete/i);
  });

  it("returns 400 when profile_picture_url is not an owned storage URL", async () => {
    const response = await PUT(
      makePutRequest({
        profile_picture_url: "https://cdn.example.com/hotlink.jpg",
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/profile picture/i);
  });

  it("returns 400 when profile_picture_url has our path shape on a foreign origin (C2-008)", async () => {
    const response = await PUT(
      makePutRequest({
        profile_picture_url:
          "https://evil.example/storage/v1/object/public/profile-pictures/user-123/avatar.jpg",
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/profile picture/i);
  });

  it("returns 400 when profile_picture_url belongs to another user", async () => {
    const response = await PUT(
      makePutRequest({
        profile_picture_url:
          "https://abc.supabase.co/storage/v1/object/public/profile-pictures/other-user/x.jpg",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("accepts a profile_picture_url under the current user's folder", async () => {
    const ownedUrl =
      "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/abc.jpg";
    const updatedProfile = {
      ...EXISTING_PROFILE,
      profile_picture_url: ownedUrl,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_PROFILE), ok(updatedProfile), ok(null)]),
    );

    const response = await PUT(
      makePutRequest({ profile_picture_url: ownedUrl }),
    );
    expect(response.status).toBe(200);
  });

  it("allows clearing profile_picture_url with null", async () => {
    const existingWithPicture = {
      ...EXISTING_PROFILE,
      profile_picture_url:
        "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg",
    };
    const updatedProfile = {
      ...existingWithPicture,
      profile_picture_url: null,
    };
    mockDeleteProfilePicture.mockResolvedValue({ ok: true });
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(existingWithPicture),
        ok(updatedProfile),
        ok(null),
      ]),
    );

    const response = await PUT(
      makePutRequest({ profile_picture_url: null }),
    );
    expect(response.status).toBe(200);
    expect(mockDeleteProfilePicture).toHaveBeenCalledOnce();
  });
});
