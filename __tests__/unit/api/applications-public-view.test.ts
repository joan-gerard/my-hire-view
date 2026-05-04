/**
 * Tests for the public-view flow — flow #6.
 *
 * GET  /api/applications/[slug]       — public read: returns application data.
 * POST /api/applications/[slug]/view  — increments view count (non-owner only).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks — declared with vi.hoisted so they are available when vi.mock
// factories run (vi.mock is hoisted to the top of the file).
// ---------------------------------------------------------------------------
const {
  mockCreateClient,
  mockCreateAdminClient,
  mockCheckRateLimit,
  mockCheckCvObjectExists,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockCreateAdminClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockCheckCvObjectExists: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mockCreateClient }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
}));
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
  checkCvObjectExists: mockCheckCvObjectExists,
}));

import { GET } from "@/app/api/applications/[slug]/route";
import { POST as postView } from "@/app/api/applications/[slug]/view/route";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const PUBLIC_APP = {
  id: "app-pub",
  slug: "volvo-engineer",
  user_id: "owner-id",
  company: "Volvo",
  role: "Engineer",
  cv_url: "https://r2.example.com/cv.pdf",
  video_url: "https://youtube.com/watch?v=abc",
  first_name: "Jane",
  last_name: "Doe",
  view_count: 5,
};

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost/api/applications/volvo-engineer");
}

function makePostRequest(): NextRequest {
  return new NextRequest(
    "http://localhost/api/applications/volvo-engineer/view",
    { method: "POST" },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
});

// ---------------------------------------------------------------------------
// GET /api/applications/[slug]  (public)
// ---------------------------------------------------------------------------
describe("GET /api/applications/[slug]", () => {
  it("returns 200 with the application and cv_exists:true", async () => {
    mockCheckCvObjectExists.mockResolvedValue(true);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([ok(PUBLIC_APP)]),
    );

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ slug: "volvo-engineer", company: "Volvo" });
    expect(json.data.cv_exists).toBe(true);
  });

  it("returns 200 with cv_exists:false when the CV file is missing", async () => {
    mockCheckCvObjectExists.mockResolvedValue(false);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(PUBLIC_APP)]));

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    const json = await response.json();
    expect(json.data.cv_exists).toBe(false);
  });

  it("omits cv_exists when cv_url is absent", async () => {
    const appWithoutCv = { ...PUBLIC_APP, cv_url: null };
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(appWithoutCv)]));

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    const json = await response.json();
    expect(json.data.cv_exists).toBeUndefined();
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns 404 when no application matches the slug", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("No rows", "PGRST116")]),
    );

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ slug: "nonexistent-slug" }),
    });
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe("Application not found");
  });

  it("returns 404 when the DB returns null data", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(429);
  });
});

// ---------------------------------------------------------------------------
// POST /api/applications/[slug]/view
// ---------------------------------------------------------------------------
describe("POST /api/applications/[slug]/view", () => {
  it("increments the view count and returns 200 for an external viewer", async () => {
    // Viewer is NOT the owner (different user_id / anonymous)
    const supabase = makeSupabaseClient(
      [ok({ user_id: "owner-id" })], // fetch application
      null,                          // viewer: anonymous (getUser → null)
    );
    const admin = { rpc: vi.fn().mockResolvedValue({ error: null }) };
    mockCreateClient.mockResolvedValue(supabase);
    mockCreateAdminClient.mockReturnValue(admin);

    const response = await postView(makePostRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(200);
    expect(admin.rpc).toHaveBeenCalledWith(
      "increment_application_view_count",
      { p_slug: "volvo-engineer" },
    );
  });

  it("does NOT increment when the owner views their own application", async () => {
    // Viewer IS the owner
    const supabase = makeSupabaseClient(
      [ok({ user_id: "owner-id" })],
      { id: "owner-id" }, // viewer === owner
    );
    const admin = { rpc: vi.fn() };
    mockCreateClient.mockResolvedValue(supabase);
    mockCreateAdminClient.mockReturnValue(admin);

    const response = await postView(makePostRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(200);
    // RPC must NOT be called for the owner
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("returns 404 when the application slug is not found", async () => {
    const supabase = makeSupabaseClient([dbError("Not found")], null);
    mockCreateClient.mockResolvedValue(supabase);

    const response = await postView(makePostRequest(), {
      params: Promise.resolve({ slug: "nonexistent" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 500 when the RPC call fails", async () => {
    const supabase = makeSupabaseClient(
      [ok({ user_id: "owner-id" })],
      null,
    );
    const admin = {
      rpc: vi.fn().mockResolvedValue({ error: { message: "RPC failed" } }),
    };
    mockCreateClient.mockResolvedValue(supabase);
    mockCreateAdminClient.mockReturnValue(admin);

    const response = await postView(makePostRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("view count");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await postView(makePostRequest(), {
      params: Promise.resolve({ slug: "volvo-engineer" }),
    });
    expect(response.status).toBe(429);
  });
});
