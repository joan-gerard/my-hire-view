/**
 * Tests for PUT /api/applications and GET /api/applications/by-id/[id]
 * — flow #5 (Edit application).
 *
 * PUT covers:
 * - Happy path: ownership check passes → updates row → 200.
 * - Schema validation (UUID id, strict keys).
 * - Old tailored CV deleted from R2 only after a successful update.
 * - Primary CVs are not deleted from R2 when switching away.
 * - 404 when application not found or belongs to another user.
 * - Slug collision → 409; other DB update errors → 400.
 * - Auth / rate-limit guards; unexpected errors → 500.
 * - Archive sets status + archived_at.
 *
 * GET by-id covers:
 * - Returns 200 + application data (incl. cv_exists) for the owner.
 * - Returns 404 when not found or not owned.
 * - Returns 401 for unauthenticated requests.
 * - Returns 400 for invalid UUID; 429 when rate limited.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockRequireAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockDeleteCvIfOurs,
  mockCheckCvObjectExists,
  mockIsOwnedTailoredCvUrl,
  mockGetCvObjectKeyFromPublicUrl,
  mockToCanonicalCvPublicUrl,
  mockValidateSlugForApplication,
  SLUG_COLLISION_USER_MESSAGE,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockDeleteCvIfOurs: vi.fn(),
  mockCheckCvObjectExists: vi.fn(),
  mockIsOwnedTailoredCvUrl: vi.fn().mockReturnValue(true),
  mockGetCvObjectKeyFromPublicUrl: vi.fn(
    (url: string | null | undefined) =>
      typeof url === "string" && url.length > 0 ? `key:${url}` : null,
  ),
  mockToCanonicalCvPublicUrl: vi.fn(
    (url: string | null | undefined) =>
      typeof url === "string" && url.length > 0 ? url : null,
  ),
  mockValidateSlugForApplication: vi.fn(),
  SLUG_COLLISION_USER_MESSAGE:
    "You already have an application with this slug. Change the text slightly or pick another slug.",
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
  deleteApplicationCvIfTailored: mockDeleteCvIfOurs,
  checkCvObjectExists: mockCheckCvObjectExists,
  isOwnedTailoredCvUrl: mockIsOwnedTailoredCvUrl,
  getCvObjectKeyFromPublicUrl: mockGetCvObjectKeyFromPublicUrl,
  toCanonicalCvPublicUrl: mockToCanonicalCvPublicUrl,
}));
vi.mock("@/lib/utils/slug", () => ({
  SLUG_COLLISION_USER_MESSAGE,
  validateSlugForApplication: mockValidateSlugForApplication,
}));

import { PUT } from "@/app/api/applications/route";
import { GET as getById } from "@/app/api/applications/by-id/[id]/route";
import {
  ok,
  dbError,
  makeSupabaseClient,
} from "../../helpers/supabase-mock";

const MOCK_USER = { id: "user-abc" };
const APP_ID = "22222222-2222-4222-8222-222222222222";
const PRIMARY_CV_ID = "33333333-3333-4333-8333-333333333333";

const EXISTING_APP = {
  id: APP_ID,
  user_id: MOCK_USER.id,
  company: "Volvo",
  role: "Engineer",
  slug: "volvo-engineer",
  cv_url: "https://r2.example.com/old-cv.pdf",
  cv_type: "tailored",
  video_url: "https://youtube.com/watch?v=old",
  status: "active",
};

function ownershipRow(
  overrides: Partial<{
    user_id: string;
    cv_url: string;
    cv_type: string;
    status: string;
  }> = {},
) {
  return {
    user_id: MOCK_USER.id,
    cv_url: EXISTING_APP.cv_url,
    cv_type: "tailored",
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
  return new NextRequest(`http://localhost/api/applications/by-id/${APP_ID}`, {
    method: "GET",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue(MOCK_USER);
  mockIsOwnedTailoredCvUrl.mockReturnValue(true);
  mockValidateSlugForApplication.mockResolvedValue({ ok: true });
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
      makePutRequest({ id: APP_ID, company: "Scania" }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ company: "Scania" });
  });

  it("returns 400 for unrecognized keys (mass-assignment blocked by schema)", async () => {
    const response = await PUT(
      makePutRequest({
        id: APP_ID,
        company: "Scania",
        user_id: "attacker",
        view_count: 99999,
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/unrecognized key/i);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when id is not a UUID", async () => {
    const response = await PUT(
      makePutRequest({ id: "app-42", company: "Scania" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/UUID/i);
  });

  it("returns 404 when the application does not exist", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const response = await PUT(
      makePutRequest({ id: APP_ID, company: "X" }),
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
      makePutRequest({ id: APP_ID, company: "X" }),
    );
    expect(response.status).toBe(404);
  });

  it("deletes the old tailored CV from R2 only after a successful update", async () => {
    const newCvUrl = "https://r2.example.com/new-cv.pdf";
    const callOrder: string[] = [];
    mockDeleteCvIfOurs.mockImplementation(async () => {
      callOrder.push("delete");
    });

    const client = makeSupabaseClient([
      ok(ownershipRow()),
      ok([]),
      ok({ ...EXISTING_APP, cv_url: newCvUrl }),
    ]);
    const originalFrom = client.from as (
      table: string,
    ) => ReturnType<typeof ok>;
    client.from = vi.fn((table: string) => {
      const chain = originalFrom(table);
      const originalUpdate = chain.update as (payload: unknown) => unknown;
      chain.update = vi.fn((payload: unknown) => {
        callOrder.push("update");
        return originalUpdate(payload);
      });
      return chain;
    }) as typeof client.from;
    mockCreateClient.mockResolvedValue(client);

    await PUT(makePutRequest({ id: APP_ID, cv_url: newCvUrl }));
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(
      EXISTING_APP.cv_url,
      "tailored",
      MOCK_USER.id,
      { onError: "log" },
    );
    expect(callOrder.indexOf("update")).toBeLessThan(
      callOrder.indexOf("delete"),
    );
  });

  it("does not delete R2 when the DB update fails after a CV change", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow()),
        ok([]),
        dbError("Update failed"),
      ]),
    );

    const response = await PUT(
      makePutRequest({
        id: APP_ID,
        cv_url: "https://r2.example.com/new-cv.pdf",
      }),
    );
    expect(response.status).toBe(400);
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("does not delete R2 when leaving a primary CV (deleteApplicationCvIfTailored no-ops)", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow({ cv_type: "primary" })),
        ok({
          url: "https://r2.example.com/cvs/user-abc/primary/cv-2.pdf",
          filename: "primary2.pdf",
        }),
        ok({
          ...EXISTING_APP,
          cv_type: "primary",
          cv_url: "https://r2.example.com/cvs/user-abc/primary/cv-2.pdf",
        }),
      ]),
    );

    await PUT(
      makePutRequest({
        id: APP_ID,
        cv_type: "primary",
        primary_cv_id: PRIMARY_CV_ID,
      }),
    );
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(
      EXISTING_APP.cv_url,
      "primary",
      MOCK_USER.id,
      { onError: "log" },
    );
  });

  it("does NOT delete the CV when cv_url is unchanged", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow()),
        ok([]),
        ok(EXISTING_APP),
      ]),
    );

    await PUT(
      makePutRequest({ id: APP_ID, cv_url: EXISTING_APP.cv_url }),
    );
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 400 when the new tailored cv_url is not a caller-owned tailored upload", async () => {
    mockIsOwnedTailoredCvUrl.mockReturnValue(false);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow())]),
    );

    const response = await PUT(
      makePutRequest({
        id: APP_ID,
        cv_url: "https://r2.example.com/cvs/other-user/tailored/x.pdf",
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe(
      "CV URL must be a tailored upload you created for this application",
    );
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 409 when tailored cv_url is already used by another application", async () => {
    const sharedUrl =
      "https://r2.example.com/cvs/user-abc/tailored/shared.pdf";
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow()),
        ok([{ id: "other-app", cv_url: sharedUrl }]),
      ]),
    );

    const response = await PUT(
      makePutRequest({
        id: APP_ID,
        cv_url: sharedUrl,
      }),
    );
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(
      "This tailored CV is already used by another application",
    );
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 409 when validateSlugForApplication reports a collision", async () => {
    mockValidateSlugForApplication.mockResolvedValue({
      ok: false,
      error: SLUG_COLLISION_USER_MESSAGE,
    });

    const response = await PUT(
      makePutRequest({ id: APP_ID, slug: "taken-slug" }),
    );
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(SLUG_COLLISION_USER_MESSAGE);
    expect(mockValidateSlugForApplication).toHaveBeenCalledWith(
      "taken-slug",
      MOCK_USER.id,
      APP_ID,
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 409 when the DB unique constraint fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(ownershipRow()),
        dbError("duplicate key value", "23505"),
      ]),
    );

    const response = await PUT(
      makePutRequest({ id: APP_ID, company: "X" }),
    );
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(SLUG_COLLISION_USER_MESSAGE);
  });

  it("returns 400 when the DB update fails for a non-unique reason", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(ownershipRow()), dbError("Update failed")]),
    );

    const response = await PUT(makePutRequest({ id: APP_ID, company: "X" }));
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
      makePutRequest({ id: APP_ID, status: "archived" }),
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

    const response = await PUT(makePutRequest({ id: APP_ID }));
    expect(response.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await PUT(makePutRequest({ id: APP_ID }));
    expect(response.status).toBe(401);
  });

  it("returns 500 when an unexpected error occurs after auth", async () => {
    mockCreateClient.mockRejectedValue(new Error("supabase down"));

    const response = await PUT(makePutRequest({ id: APP_ID, company: "X" }));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to update application");
  });
});

describe("GET /api/applications/by-id/[id]", () => {
  it("returns 200 with the application data (cv_exists included)", async () => {
    mockCheckCvObjectExists.mockResolvedValue(true);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(EXISTING_APP)]));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ id: APP_ID, slug: "volvo-engineer" });
    expect(json.data.cv_exists).toBe(true);
  });

  it("returns cv_exists:false when the CV file is missing", async () => {
    mockCheckCvObjectExists.mockResolvedValue(false);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(EXISTING_APP)]));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    const json = await response.json();
    expect(json.data.cv_exists).toBe(false);
  });

  it("omits cv_exists when the URL is outside our R2 public base", async () => {
    mockCheckCvObjectExists.mockResolvedValue(undefined);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(EXISTING_APP)]));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    const json = await response.json();
    expect(json.data).toMatchObject({ id: APP_ID, cv_url: EXISTING_APP.cv_url });
    expect(json.data.cv_exists).toBeUndefined();
  });

  it("returns 404 when the application is not found or not owned by user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 404 when the DB returns an error", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("Not found")]),
    );

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 when id is not a valid UUID", async () => {
    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: "not-a-uuid" }),
    });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Application ID must be a valid UUID");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    expect(response.status).toBe(429);
    expect(mockRequireAuth).not.toHaveBeenCalled();
  });

  it("returns 500 when an unexpected error occurs after auth", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateClient.mockRejectedValue(new Error("supabase down"));

    const response = await getById(makeGetRequest(), {
      params: Promise.resolve({ id: APP_ID }),
    });
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to fetch application");
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
