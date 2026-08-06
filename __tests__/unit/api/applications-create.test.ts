/**
 * Tests for POST /api/applications — flow #4 (Create application).
 *
 * Covers:
 * - Happy path: inserts new application row and returns 201.
 * - Profile fallback: candidate fields pulled from profile when not in body.
 * - Profile picture preference: persists show_profile_picture (URL comes from profile at view time).
 * - Schema validation → clear 400s before insert.
 * - Auth / rate-limit guards; unexpected errors → 500 (not 401).
 * - Slug uniqueness re-check (validateSlugForApplication) → 409 when taken.
 * - Unique constraint (slug) → 409; other DB insert failures → 400.
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
  checkCvObjectExists: vi.fn().mockResolvedValue(true),
  isOwnedTailoredCvUrl: mockIsOwnedTailoredCvUrl,
  getCvObjectKeyFromPublicUrl: mockGetCvObjectKeyFromPublicUrl,
  toCanonicalCvPublicUrl: mockToCanonicalCvPublicUrl,
}));
vi.mock("@/lib/auth/ensure-public-id", () => ({
  ensureProfilePublicId: vi.fn().mockResolvedValue("k7x2m9ab"),
}));
vi.mock("@/lib/utils/slug", () => ({
  SLUG_COLLISION_USER_MESSAGE,
  validateSlugForApplication: mockValidateSlugForApplication,
}));

import { POST } from "@/app/api/applications/route";
import {
  ok,
  okWithCount,
  dbError,
  makeSupabaseClient,
} from "../../helpers/supabase-mock";

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

/** Chains for tailored create: profile → exact URL free → legacy scan free → insert */
function tailoredCreateChains(
  insertResult: ReturnType<typeof ok> | ReturnType<typeof dbError>,
) {
  return [
    ok(PROFILE_SNAPSHOT),
    okWithCount(null, 0),
    ok([]),
    insertResult,
  ];
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
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/applications", () => {
  it("returns 201 with the created application on success", async () => {
    const newApp = { id: "app-1", ...BASE_APP_INPUT, user_id: MOCK_USER.id };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient(tailoredCreateChains(ok(newApp))),
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
      makeSupabaseClient(tailoredCreateChains(ok(newApp))),
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
      makeSupabaseClient(tailoredCreateChains(ok(newApp))),
    );

    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, first_name: "Custom", last_name: null }),
    );
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.first_name).toBe("Custom");
  });

  it("persists show_profile_picture true without a stored picture URL", async () => {
    const newApp = {
      ...BASE_APP_INPUT,
      id: "app-4",
      user_id: MOCK_USER.id,
      show_profile_picture: true,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient(tailoredCreateChains(ok(newApp))),
    );

    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, show_profile_picture: true }),
    );
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.show_profile_picture).toBe(true);
    expect(json.data.profile_picture_url).toBeUndefined();
  });

  it("persists show_profile_picture false", async () => {
    const newApp = {
      ...BASE_APP_INPUT,
      id: "app-5",
      user_id: MOCK_USER.id,
      show_profile_picture: false,
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient(tailoredCreateChains(ok(newApp))),
    );

    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, show_profile_picture: false }),
    );
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.show_profile_picture).toBe(false);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(
      makePostRequest({ company: "Volvo", role: "Engineer" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(typeof json.error).toBe("string");
    expect(json.error.length).toBeGreaterThan(0);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when slug format is invalid", async () => {
    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, slug: "Volvo Engineer" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/lowercase|hyphen/i);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when video_url is not a valid http(s) URL", async () => {
    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, video_url: "not-a-url" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/Video URL/i);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when body includes unexpected keys", async () => {
    const response = await POST(
      makePostRequest({ ...BASE_APP_INPUT, user_id: "attacker" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/unrecognized key/i);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when tailored cv_url is not a caller-owned tailored upload", async () => {
    mockIsOwnedTailoredCvUrl.mockReturnValue(false);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT)]),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe(
      "CV URL must be a tailored upload you created for this application",
    );
  });

  it("returns 409 when tailored cv_url is already used by another application", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PROFILE_SNAPSHOT), okWithCount(null, 1)]),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(
      "This tailored CV is already used by another application",
    );
  });

  it("returns 409 when a URL-equivalent tailored CV is found via keyset scan", async () => {
    const legacyVariant = `${BASE_APP_INPUT.cv_url}?x=1`;
    mockGetCvObjectKeyFromPublicUrl.mockImplementation((url) => {
      if (typeof url !== "string" || url.length === 0) return null;
      return `key:${url.split("?")[0]}`;
    });
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(PROFILE_SNAPSHOT),
        okWithCount(null, 0),
        ok([{ id: "other-app", cv_url: legacyVariant }]),
      ]),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(
      "This tailored CV is already used by another application",
    );
  });

  it("returns 409 when validateSlugForApplication reports the slug is taken", async () => {
    mockValidateSlugForApplication.mockResolvedValue({
      ok: false,
      error: SLUG_COLLISION_USER_MESSAGE,
    });

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(SLUG_COLLISION_USER_MESSAGE);
    expect(mockValidateSlugForApplication).toHaveBeenCalledWith(
      BASE_APP_INPUT.slug,
      MOCK_USER.id,
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 409 with a stable message when slug unique constraint fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient(
        tailoredCreateChains(
          dbError(
            'duplicate key value violates unique constraint "applications_user_id_slug_key"',
            "23505",
          ),
        ),
      ),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(SLUG_COLLISION_USER_MESSAGE);
  });

  it("returns 409 when tailored cv_url unique constraint fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient(
        tailoredCreateChains(
          dbError(
            'duplicate key value violates unique constraint "applications_user_id_tailored_cv_url_key"',
            "23505",
          ),
        ),
      ),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe(
      "This tailored CV is already used by another application",
    );
  });

  it("returns 400 when the DB insert fails for a non-unique reason", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient(tailoredCreateChains(dbError("check constraint"))),
    );

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("check constraint");
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

  it("returns 500 when an unexpected error occurs after auth", async () => {
    mockCreateClient.mockRejectedValue(new Error("supabase down"));

    const response = await POST(makePostRequest(BASE_APP_INPUT));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to create application");
  });
});
