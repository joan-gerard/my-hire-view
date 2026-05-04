/**
 * Tests for POST /api/applications — flow #4 (Create application).
 *
 * Covers:
 * - Happy path: inserts new application row and returns 201.
 * - Profile fallback: candidate fields pulled from profile when not in body.
 * - Profile picture: resolved from snapshot when show_profile_picture is true.
 * - Auth / rate-limit guards.
 * - DB insert failure → 400.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks — declared with vi.hoisted so they are available when vi.mock
// factories run (vi.mock is hoisted to the top of the file).
// ---------------------------------------------------------------------------
const {
  mockRequireAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockDeleteCvIfOurs,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockDeleteCvIfOurs: vi.fn(),
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
vi.mock("@/lib/utils/cv-storage", () => ({
  deleteCvIfOurs: mockDeleteCvIfOurs,
}));

import { POST } from "@/app/api/applications/route";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const MOCK_USER = { id: "user-abc" };

const PROFILE_SNAPSHOT = {
  first_name: "Jane",
  last_name: "Doe",
  location: "Stockholm",
  portfolio_url: "https://janedoe.dev",
  linkedin_url: null,
  profile_picture_url: "https://r2.example.com/avatar.jpg",
};

const BASE_APP_INPUT = {
  company: "Volvo",
  role: "Software Engineer",
  slug: "volvo-software-engineer",
  cv_url: "https://r2.example.com/cv.pdf",
  video_url: "https://youtube.com/watch?v=abc",
};

function makePostRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/applications", {
    method: "POST",
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/applications", () => {
  it("returns 201 with the created application on success", async () => {
    const newApp = { id: "app-1", ...BASE_APP_INPUT, user_id: MOCK_USER.id };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(PROFILE_SNAPSHOT), // getProfileSnapshot
        ok(newApp),           // insert
      ]),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data).toMatchObject({ id: "app-1", slug: "volvo-software-engineer" });
  });

  it("fills candidate fields from profile when not supplied in body", async () => {
    const newApp = {
      ...BASE_APP_INPUT,
      id: "app-2",
      user_id: MOCK_USER.id,
      first_name: "Jane",
      last_name: "Doe",
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT), ok(newApp)]),
    );

    // Do NOT send any candidate fields — they should come from the profile
    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.first_name).toBe("Jane");
    expect(json.data.last_name).toBe("Doe");
  });

  it("uses body candidate fields over profile when explicitly supplied", async () => {
    const newApp = {
      ...BASE_APP_INPUT,
      id: "app-3",
      user_id: MOCK_USER.id,
      first_name: "Custom",
      last_name: null,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT), ok(newApp)]),
    );

    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, first_name: "Custom", last_name: null }),
    );
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.first_name).toBe("Custom");
  });

  it("sets profile_picture_url when show_profile_picture is true", async () => {
    const newApp = {
      ...BASE_APP_INPUT,
      id: "app-4",
      user_id: MOCK_USER.id,
      profile_picture_url: PROFILE_SNAPSHOT.profile_picture_url,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT), ok(newApp)]),
    );

    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, show_profile_picture: true }),
    );
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.profile_picture_url).toBe(
      PROFILE_SNAPSHOT.profile_picture_url,
    );
  });

  it("sets profile_picture_url to null when show_profile_picture is false", async () => {
    const newApp = {
      ...BASE_APP_INPUT,
      id: "app-5",
      user_id: MOCK_USER.id,
      profile_picture_url: null,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT), ok(newApp)]),
    );

    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, show_profile_picture: false }),
    );
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.profile_picture_url).toBeNull();
  });

  it("returns 400 when the DB insert fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT), dbError("Unique constraint")]),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });
});
