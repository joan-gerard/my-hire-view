/**
 * Tests for GET /api/applications/counts — dashboard status tallies.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { authOk, authUnauthorized } from "../../helpers/auth-mock";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

const { mockWithAuth, mockCreateClient, mockCheckRateLimit } = vi.hoisted(
  () => ({
    mockWithAuth: vi.fn(),
    mockCreateClient: vi.fn(),
    mockCheckRateLimit: vi.fn(),
  }),
);

vi.mock("@/lib/api/with-auth", () => ({ withAuth: mockWithAuth }));
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

import { GET } from "@/app/api/applications/counts/route";

const MOCK_USER = { id: "user-abc" };

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost/api/applications/counts", {
    method: "GET",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockWithAuth.mockResolvedValue(authOk(MOCK_USER));
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
});

describe("GET /api/applications/counts", () => {
  it("returns aggregated tallies from a single status select", async () => {
    const chain = ok([
      { status: "active" },
      { status: "active" },
      { status: "draft" },
      { status: "archived" },
    ]);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual({
      all: 4,
      active: 2,
      draft: 1,
      archived: 1,
    });
    expect(chain.select).toHaveBeenCalledWith("status");
    expect(chain.eq).toHaveBeenCalledWith("user_id", MOCK_USER.id);
  });

  it("returns zeros when the user has no applications", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok([])]));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { all: 0, active: 0, draft: 0, archived: 0 },
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockWithAuth.mockResolvedValue(authUnauthorized());

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(401);
  });

  it("returns 500 when the query fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("db down")]),
    );

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "db down" });
  });
});
