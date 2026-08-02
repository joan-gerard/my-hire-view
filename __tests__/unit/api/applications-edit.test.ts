/**
 * Tests for PUT /api/applications and GET /api/applications/by-id/[id]
 * — flow #5 (Edit application).
 *
 * PUT covers:
 * - Happy path: ownership check passes → updates row → 200.
 * - Old custom CV deleted from R2 when cv_url changes.
 * - Master CVs are not deleted from R2 when switching away.
 * - 404 when application not found or belongs to another user.
 * - DB update error → 400.
 * - Auth / rate-limit guards.
 * - Archive sets status + archived_at.
 *
 * GET by-id covers:
 * - Returns 200 + application data (incl. cv_exists) for the owner.
 * - Returns 404 when not found or not owned.
 * - Returns 401 for unauthenticated requests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockRequireAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockDeleteCvIfOurs,
  mockCheckCvObjectExists,
  mockIsOwnedCvUrl,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockDeleteCvIfOurs: vi.fn(),
  mockCheckCvObjectExists: vi.fn(),
  mockIsOwnedCvUrl: vi.fn().mockReturnValue(true),
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
  deleteApplicationCvIfCustom: mockDeleteCvIfOurs,
  checkCvObjectExists: mockCheckCvObjectExists,
  isOwnedCvUrl: mockIsOwnedCvUrl,
}));

import { PUT } from "@/app/api/applications/route";
import { GET as getById } from "@/app/api/applications/by-id/[id]/route";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

const MOCK_USER = { id: "user-abc" };

const EXISTING_APP = {
  id: "app-42",
  user_id: MOCK_USER.id,
  company: "Volvo",
  role: "Engineer",
  slug: "volvo-engineer",
  cv_url: "https://r2.example.com/old-cv.pdf",
  cv_kind: "custom",
  video_url: "https://youtube.com/watch?v=old",
  status: "active",
};

function ownershipRow(
  overrides: Partial<{
    user_id: string;
    cv_url: string;
    cv_kind: string;
    status: string;
  }> = {},
) {
  return {
    user_id: MOCK_USER.id,
    cv_url: EXISTING_APP.cv_url,
    cv_kind: "custom",
    status: "active",
    ...overrides,
  };
}

function makePutRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/applications", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost/api/applications/by-id/app-42", {
    method: "GET",
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
  mockDeleteCvIfOurs.mockResolvedValue(undefined);
  mockCheckCvObjectExists.mockResolvedValue(true);
});

describe("PUT /api/applications", () => {
  it("returns 200 with the updated application on success", async () => {
    const updatedApp = { ...EXISTING_APP, company: "Scania" };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow()), ok(updatedApp)]),
    );

    const response = await PUT(
      makePutRequest({ id: "app-42", company: "Scania" }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ company: "Scania" });
  });

  it("returns 404 when the application does not exist", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const response = await PUT(
      makePutRequest({ id: "nonexistent", company: "X" }),
    );
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toContain("unauthorized");
  });

  it("returns 404 when the application belongs to another user", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow({ user_id: "other-user" }))]),
    );

    const response = await PUT(
      makePutRequest({ id: "app-42", company: "X" }),
    );
    expect(response.status).toBe(404);
  });

  it("deletes the old custom CV from R2 when cv_url changes", async () => {
    const newCvUrl = "https://r2.example.com/new-cv.pdf";
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow()),
        ok({ ...EXISTING_APP, cv_url: newCvUrl }),
      ]),
    );

    await PUT(makePutRequest({ id: "app-42", cv_url: newCvUrl }));
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(
      EXISTING_APP.cv_url,
      "custom",
      MOCK_USER.id,
    );
  });

  it("does not delete R2 when leaving a master CV (deleteApplicationCvIfCustom no-ops)", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow({ cv_kind: "master" })),
        ok({
          url: "https://r2.example.com/master2.pdf",
          filename: "master2.pdf",
        }),
        ok({
          ...EXISTING_APP,
          cv_kind: "master",
          cv_url: "https://r2.example.com/master2.pdf",
        }),
      ]),
    );

    await PUT(
      makePutRequest({
        id: "app-42",
        cv_kind: "master",
        master_cv_id: "master-2",
      }),
    );
    // Helper is still invoked with kind=master; implementation skips DeleteObject
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(
      EXISTING_APP.cv_url,
      "master",
      MOCK_USER.id,
    );
  });

  it("does NOT delete the CV when cv_url is unchanged", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow()), ok(EXISTING_APP)]),
    );

    await PUT(
      makePutRequest({ id: "app-42", cv_url: EXISTING_APP.cv_url }),
    );
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 400 when the new custom cv_url is not owned by the caller", async () => {
    mockIsOwnedCvUrl.mockReturnValue(false);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow())]),
    );

    const response = await PUT(
      makePutRequest({
        id: "app-42",
        cv_url: "https://r2.example.com/cvs/other-user/idempotency/x.pdf",
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("CV URL must be an object you uploaded");
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 400 when the DB update fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow()), dbError("Update failed")]),
    );

    const response = await PUT(makePutRequest({ id: "app-42", company: "X" }));
    expect(response.status).toBe(400);
  });

  it("sets status archived on archive", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow()),
        ok({
          ...EXISTING_APP,
          status: "archived",
          archived_at: "2026-07-27T12:00:00.000Z",
        }),
      ]),
    );

    const response = await PUT(
      makePutRequest({ id: "app-42", status: "archived" }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.status).toBe("archived");
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

describe("GET /api/applications/by-id/[id]", () => {
  it("returns 200 with the application data (cv_exists included)", async () => {
    mockCheckCvObjectExists.mockResolvedValue(true);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(EXISTING_APP)]));

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
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(EXISTING_APP)]));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "app-42" }),
    });
    const json = await response.json();
    expect(json.data.cv_exists).toBe(false);
  });

  it("returns 404 when the application is not found or not owned by user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

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
