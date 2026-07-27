/**
 * Tests for the public-view flow — flow #6.
 *
 * GET  /api/applications/[publicId]/[slug]       — public read: returns application data.
 * POST /api/applications/[publicId]/[slug]/view  — increments view count (non-owner only).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockCreateClient,
  mockCreateAdminClient,
  mockCheckRateLimit,
  mockCheckCvObjectExists,
  mockResolvePublicApplication,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockCreateAdminClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockCheckCvObjectExists: vi.fn(),
  mockResolvePublicApplication: vi.fn(),
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
vi.mock("@/lib/utils/resolve-public-application", () => ({
  resolvePublicApplication: mockResolvePublicApplication,
}));

import { GET } from "@/app/api/applications/[publicId]/[slug]/route";
import { POST as postView } from "@/app/api/applications/[publicId]/[slug]/view/route";

const PUBLIC_ID = "k7x2m9ab";
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

const ROUTE_PARAMS = Promise.resolve({
  publicId: PUBLIC_ID,
  slug: "volvo-engineer",
});

function makeGetRequest(): NextRequest {
  return new NextRequest(
    `http://localhost/api/applications/${PUBLIC_ID}/volvo-engineer`,
  );
}

function makePostRequest(): NextRequest {
  return new NextRequest(
    `http://localhost/api/applications/${PUBLIC_ID}/volvo-engineer/view`,
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
  mockCreateClient.mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  });
});

describe("GET /api/applications/[publicId]/[slug]", () => {
  it("returns 200 with the application and cv_exists:true", async () => {
    mockCheckCvObjectExists.mockResolvedValue(true);
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });

    const response = await GET(makeGetRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toMatchObject({ slug: "volvo-engineer", company: "Volvo" });
    expect(json.data.cv_exists).toBe(true);
  });

  it("returns 200 with cv_exists:false when the CV file is missing", async () => {
    mockCheckCvObjectExists.mockResolvedValue(false);
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });

    const response = await GET(makeGetRequest(), { params: ROUTE_PARAMS });
    const json = await response.json();
    expect(json.data.cv_exists).toBe(false);
  });

  it("omits cv_exists when cv_url is absent", async () => {
    const appWithoutCv = { ...PUBLIC_APP, cv_url: null };
    mockResolvePublicApplication.mockResolvedValue({
      application: appWithoutCv,
      ownerUserId: "owner-id",
    });

    const response = await GET(makeGetRequest(), { params: ROUTE_PARAMS });
    const json = await response.json();
    expect(json.data.cv_exists).toBeUndefined();
    expect(mockCheckCvObjectExists).not.toHaveBeenCalled();
  });

  it("returns 404 when no application matches", async () => {
    mockResolvePublicApplication.mockResolvedValue(null);

    const response = await GET(makeGetRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe("Application not found");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await GET(makeGetRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(429);
  });
});

describe("POST /api/applications/[publicId]/[slug]/view", () => {
  it("increments the view count and returns 200 for an external viewer", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });
    const admin = { rpc: vi.fn().mockResolvedValue({ error: null }) };
    mockCreateAdminClient.mockReturnValue(admin);

    const response = await postView(makePostRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(200);
    expect(admin.rpc).toHaveBeenCalledWith(
      "increment_application_view_count",
      { p_public_id: PUBLIC_ID, p_slug: "volvo-engineer" },
    );
  });

  it("does NOT increment when the owner views their own application", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "owner-id" } } }),
      },
    });
    const admin = { rpc: vi.fn() };
    mockCreateAdminClient.mockReturnValue(admin);

    const response = await postView(makePostRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(200);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("returns 404 when the application is not found", async () => {
    mockResolvePublicApplication.mockResolvedValue(null);

    const response = await postView(makePostRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(404);
  });

  it("returns 500 when the RPC call fails", async () => {
    mockResolvePublicApplication.mockResolvedValue({
      application: PUBLIC_APP,
      ownerUserId: "owner-id",
    });
    const admin = {
      rpc: vi.fn().mockResolvedValue({ error: { message: "RPC failed" } }),
    };
    mockCreateAdminClient.mockReturnValue(admin);

    const response = await postView(makePostRequest(), { params: ROUTE_PARAMS });
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

    const response = await postView(makePostRequest(), { params: ROUTE_PARAMS });
    expect(response.status).toBe(429);
  });
});
