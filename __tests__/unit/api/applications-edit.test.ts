/**
 * Tests for PUT /api/applications and GET /api/applications/by-id/[id]
 * — flow #5 (Edit application).
 *
 * PUT covers:
 * - Happy path: ownership check passes → updates row → 200.
 * - Old CV deleted from R2 when cv_url changes.
 * - 404 when application not found or belongs to another user.
 * - DB update error → 400.
 * - Auth / rate-limit guards.
 *
 * GET by-id covers:
 * - Returns 200 + application data (incl. cv_exists) for the owner.
 * - Returns 404 when not found or not owned.
 * - Returns 401 for unauthenticated requests.
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
  mockCheckCvObjectExists,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockDeleteCvIfOurs: vi.fn(),
  mockCheckCvObjectExists: vi.fn(),
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
  checkCvObjectExists: mockCheckCvObjectExists,
}));

import { PUT } from "@/app/api/applications/route";
import { GET as getById } from "@/app/api/applications/by-id/[id]/route";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const MOCK_USER = { id: "user-abc" };

const EXISTING_APP = {
  id: "app-42",
  user_id: MOCK_USER.id,
  company: "Volvo",
  role: "Engineer",
  slug: "volvo-engineer",
  cv_url: "https://r2.example.com/old-cv.pdf",
  video_url: "https://youtube.com/watch?v=old",
};

function makePutRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/applications", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost/api/applications/by-id/app-42");
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue(MOCK_USER);
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
  mockDeleteCvIfOurs.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// PUT /api/applications
// ---------------------------------------------------------------------------
describe("PUT /api/applications", () => {
  it("returns 200 with the updated application on success", async () => {
    const updatedApp = { ...EXISTING_APP, company: "Scania" };
    const profileSnapshot = {
      first_name: null, last_name: null, location: null,
      portfolio_url: null, linkedin_url: null, profile_picture_url: null,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ user_id: MOCK_USER.id, cv_url: EXISTING_APP.cv_url }), // ownership check
        ok(profileSnapshot),  // getProfileSnapshot
        ok(updatedApp),       // update
      ]),
    );

    const response = await PUT(
      makePutRequest({ id: "app-42", company: "Scania" }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ company: "Scania" });
  });

  it("returns 404 when the application does not exist", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(null)]), // ownership check returns null
    );

    const response = await PUT(
      makePutRequest({ id: "nonexistent", company: "X" }),
    );
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toContain("unauthorized");
  });

  it("returns 404 when the application belongs to another user", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ user_id: "other-user", cv_url: "https://r2.example.com/cv.pdf" }),
      ]),
    );

    const response = await PUT(
      makePutRequest({ id: "app-42", company: "X" }),
    );
    expect(response.status).toBe(404);
  });

  it("deletes the old CV from R2 when cv_url changes", async () => {
    const newCvUrl = "https://r2.example.com/new-cv.pdf";
    const profileSnapshot = {
      first_name: null, last_name: null, location: null,
      portfolio_url: null, linkedin_url: null, profile_picture_url: null,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ user_id: MOCK_USER.id, cv_url: EXISTING_APP.cv_url }),
        ok(profileSnapshot),
        ok({ ...EXISTING_APP, cv_url: newCvUrl }),
      ]),
    );

    await PUT(makePutRequest({ id: "app-42", cv_url: newCvUrl }));
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(EXISTING_APP.cv_url);
  });

  it("does NOT delete the CV when cv_url is unchanged", async () => {
    const profileSnapshot = {
      first_name: null, last_name: null, location: null,
      portfolio_url: null, linkedin_url: null, profile_picture_url: null,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ user_id: MOCK_USER.id, cv_url: EXISTING_APP.cv_url }),
        ok(profileSnapshot),
        ok(EXISTING_APP),
      ]),
    );

    // Sending the same cv_url — no deletion expected
    await PUT(
      makePutRequest({ id: "app-42", cv_url: EXISTING_APP.cv_url }),
    );
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 400 when the DB update fails", async () => {
    const profileSnapshot = {
      first_name: null, last_name: null, location: null,
      portfolio_url: null, linkedin_url: null, profile_picture_url: null,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({ user_id: MOCK_USER.id, cv_url: EXISTING_APP.cv_url }),
        ok(profileSnapshot),
        dbError("Update failed"),
      ]),
    );

    const response = await PUT(makePutRequest({ id: "app-42", company: "X" }));
    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await PUT(makePutRequest({ id: "app-42" }));
    expect(response.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await PUT(makePutRequest({ id: "app-42" }));
    expect(response.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/applications/by-id/[id]
// ---------------------------------------------------------------------------
describe("GET /api/applications/by-id/[id]", () => {
  it("returns 200 with the application data (cv_exists included)", async () => {
    mockCheckCvObjectExists.mockResolvedValue(true);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_APP)]),
    );

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "app-42" }),
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ id: "app-42", slug: "volvo-engineer" });
    expect(json.data.cv_exists).toBe(true);
  });

  it("returns cv_exists:false when the CV file is missing", async () => {
    mockCheckCvObjectExists.mockResolvedValue(false);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(EXISTING_APP)]),
    );

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "app-42" }),
    });
    const json = await response.json();
    expect(json.data.cv_exists).toBe(false);
  });

  it("returns 404 when the application is not found or not owned by user", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(null)]),
    );

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "app-42" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 404 when the DB returns an error", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("Not found")]),
    );

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "app-42" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "app-42" }),
    });
    expect(response.status).toBe(401);
  });
});
