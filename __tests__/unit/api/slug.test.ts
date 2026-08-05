/**
 * Tests for POST /api/slug and POST /api/slug/validate — part of flow #4
 * (Create application — live slug feedback and save).
 *
 * /api/slug          — derives a slug from company + role; checks DB uniqueness.
 * /api/slug/validate — validates format and uniqueness of a user-typed slug.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks — declared with vi.hoisted so they are available when vi.mock
// factories run (vi.mock is hoisted to the top of the file).
// ---------------------------------------------------------------------------
const {
  mockReserveBaseSlug,
  mockValidateSlugForApplication,
  mockRequireAuth,
  mockCheckRateLimit,
  mockCreateClient,
} = vi.hoisted(() => ({
  mockReserveBaseSlug: vi.fn(),
  mockValidateSlugForApplication: vi.fn(),
  mockRequireAuth: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockCreateClient: vi.fn(),
}));

vi.mock("@/lib/utils/slug", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/slug")>();
  return {
    ...actual,
    reserveBaseSlug: mockReserveBaseSlug,
    validateSlugForApplication: mockValidateSlugForApplication,
  };
});
vi.mock("@/lib/auth", () => ({ requireAuth: mockRequireAuth }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mockCreateClient }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  DEFAULT_API_RATE_LIMIT: { limit: 60, windowMs: 60_000 },
  SLUG_VALIDATE_RATE_LIMIT: { limit: 30, windowMs: 60_000 },
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
}));

import { POST as slugPost } from "@/app/api/slug/route";
import { POST as validatePost } from "@/app/api/slug/validate/route";

// Also import the real SlugCollisionError for instanceof checks
import { SlugCollisionError } from "@/lib/utils/slug";
import { ok, makeSupabaseClient } from "../../helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeRawRequest(url: string, body: string): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });
}

const OWNED_EXCLUDE_ID = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
  mockRequireAuth.mockResolvedValue({ id: "user-123" });
});

// ---------------------------------------------------------------------------
// POST /api/slug
// ---------------------------------------------------------------------------
describe("POST /api/slug", () => {
  it("returns 200 with the derived slug when available", async () => {
    mockReserveBaseSlug.mockResolvedValue("volvo-software-engineer");

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Software Engineer",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.slug).toBe("volvo-software-engineer");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("includes name in slug when slugNamePosition and names are provided", async () => {
    mockReserveBaseSlug.mockResolvedValue("john-doe-volvo-software-engineer");

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Software Engineer",
      first_name: "John",
      last_name: "Doe",
      slugNamePosition: "start",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.slug).toBe("john-doe-volvo-software-engineer");
    expect(mockReserveBaseSlug).toHaveBeenCalledWith(
      "Volvo",
      "Software Engineer",
      "user-123",
      undefined,
      "John",
      "Doe",
      "start",
    );
  });

  it("returns 400 when company is missing", async () => {
    const req = makeRequest("http://localhost/api/slug", {
      role: "Engineer",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("required");
  });

  it("returns 400 when role is missing", async () => {
    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = makeRawRequest("http://localhost/api/slug", "{not-json");
    const response = await slugPost(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid JSON body");
  });

  it("returns 400 for a JSON null body", async () => {
    const req = makeRequest("http://localhost/api/slug", null);
    const response = await slugPost(req);
    expect(response.status).toBe(400);
    expect(mockReserveBaseSlug).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid slugNamePosition", async () => {
    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
      slugNamePosition: "middle",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(400);
  });

  it("returns 400 when excludeId is not a UUID", async () => {
    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
      excludeId: "app-id-42",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/UUID/i);
  });

  it("passes owned excludeId to reserveBaseSlug", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok({ id: OWNED_EXCLUDE_ID })]),
    );
    mockReserveBaseSlug.mockResolvedValue("volvo-engineer");

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
      excludeId: OWNED_EXCLUDE_ID,
    });
    const response = await slugPost(req);
    expect(response.status).toBe(200);
    expect(mockReserveBaseSlug).toHaveBeenCalledWith(
      "Volvo",
      "Engineer",
      "user-123",
      OWNED_EXCLUDE_ID,
      null,
      null,
      null,
    );
  });

  it("returns 404 when excludeId is not owned by the current user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
      excludeId: OWNED_EXCLUDE_ID,
    });
    const response = await slugPost(req);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe("Application not found");
    expect(mockReserveBaseSlug).not.toHaveBeenCalled();
  });

  it("returns 409 when the slug is already taken (SlugCollisionError)", async () => {
    mockReserveBaseSlug.mockRejectedValue(
      new SlugCollisionError("This slug is already in use."),
    );

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBeTruthy();
  });

  it("returns 500 for unexpected errors", async () => {
    mockReserveBaseSlug.mockRejectedValue(new Error("Unexpected DB failure"));

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(500);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const req = makeRequest("http://localhost/api/slug", {
      company: "Volvo",
      role: "Engineer",
    });
    const response = await slugPost(req);
    expect(response.status).toBe(429);
  });
});

// ---------------------------------------------------------------------------
// POST /api/slug/validate
// ---------------------------------------------------------------------------
describe("POST /api/slug/validate", () => {
  it("returns 200 with ok:true for a valid and available slug", async () => {
    mockValidateSlugForApplication.mockResolvedValue({ ok: true });

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "volvo-engineer",
    });
    const response = await validatePost(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 200 with ok:false when slug format is invalid", async () => {
    mockValidateSlugForApplication.mockResolvedValue({
      ok: false,
      error: "Use lowercase letters and hyphens.",
    });

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "INVALID SLUG",
    });
    const response = await validatePost(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBeTruthy();
  });

  it("returns 200 with ok:false when the slug is already taken", async () => {
    mockValidateSlugForApplication.mockResolvedValue({
      ok: false,
      error: "This slug is already in use.",
    });

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "taken-slug",
    });
    const response = await validatePost(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(false);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = makeRawRequest(
      "http://localhost/api/slug/validate",
      "{not-json",
    );
    const response = await validatePost(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid JSON body");
  });

  it("returns 400 for a JSON null body", async () => {
    const req = makeRequest("http://localhost/api/slug/validate", null);
    const response = await validatePost(req);
    expect(response.status).toBe(400);
    expect(mockValidateSlugForApplication).not.toHaveBeenCalled();
  });

  it("returns 400 when slug is missing", async () => {
    const req = makeRequest("http://localhost/api/slug/validate", {});
    const response = await validatePost(req);
    expect(response.status).toBe(400);
  });

  it("returns 400 when excludeId is not a UUID", async () => {
    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "volvo-engineer",
      excludeId: "app-id-42",
    });
    const response = await validatePost(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/UUID/i);
  });

  it("passes owned excludeId to the validation helper (edit flow)", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok({ id: OWNED_EXCLUDE_ID })]),
    );
    mockValidateSlugForApplication.mockResolvedValue({ ok: true });

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "volvo-engineer",
      excludeId: OWNED_EXCLUDE_ID,
    });
    await validatePost(req);
    expect(mockValidateSlugForApplication).toHaveBeenCalledWith(
      "volvo-engineer",
      "user-123",
      OWNED_EXCLUDE_ID,
    );
  });

  it("returns 404 when excludeId is not owned by the current user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "volvo-engineer",
      excludeId: OWNED_EXCLUDE_ID,
    });
    const response = await validatePost(req);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe("Application not found");
    expect(mockValidateSlugForApplication).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "volvo-engineer",
    });
    const response = await validatePost(req);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const req = makeRequest("http://localhost/api/slug/validate", {
      slug: "volvo-engineer",
    });
    const response = await validatePost(req);
    expect(response.status).toBe(429);
  });
});
