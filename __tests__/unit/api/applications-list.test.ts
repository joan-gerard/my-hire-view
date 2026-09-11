/**
 * Tests for GET /api/applications — paginated dashboard list.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { authOk, authUnauthorized } from "../../helpers/auth-mock";

const {
  mockWithAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockCheckCvObjectExists,
} = vi.hoisted(() => ({
  mockWithAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockCheckCvObjectExists: vi.fn().mockResolvedValue(true),
}));

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
vi.mock("@/lib/utils/cv-storage", () => ({
  deleteCvIfOurs: vi.fn(),
  deleteApplicationCvIfTailored: vi.fn(),
  checkCvObjectExists: mockCheckCvObjectExists,
  isOwnedTailoredCvUrl: vi.fn().mockReturnValue(true),
}));
vi.mock("@/lib/auth/ensure-public-id", () => ({
  resolvePublicIdReadOnly: vi.fn().mockResolvedValue("k7x2m9ab"),
  ensureProfilePublicId: vi.fn().mockResolvedValue("k7x2m9ab"),
}));

import { GET } from "@/app/api/applications/route";
import { resolvePublicIdReadOnly } from "@/lib/auth/ensure-public-id";
import {
  APPLICATION_LIST_DEFAULT_LIMIT,
  APPLICATION_LIST_MAX_LIMIT,
} from "@/lib/types/application";
import { okWithCount, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

const MOCK_USER = { id: "user-abc" };

const LIST_ITEM = {
  id: "app-1",
  slug: "acme-engineer",
  company: "Acme",
  role: "Engineer",
  status: "active",
  archived_at: null,
  view_count: 2,
  download_count: 1,
  created_at: "2026-07-01T12:00:00.000Z",
  last_viewed_at: null,
  cv_url: "https://r2.example.com/cv.pdf",
};

function makeGetRequest(query = ""): NextRequest {
  const url = query
    ? `http://localhost/api/applications?${query}`
    : "http://localhost/api/applications";
  return new NextRequest(url, { method: "GET" });
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

describe("GET /api/applications", () => {
  it("returns a page with default limit and meta.total", async () => {
    const chain = okWithCount([LIST_ITEM], 21);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data).toEqual([
      { ...LIST_ITEM, public_id: "k7x2m9ab", cv_exists: true },
    ]);
    expect(json.meta).toEqual({
      limit: APPLICATION_LIST_DEFAULT_LIMIT,
      offset: 0,
      total: 21,
    });
    expect(chain.range).toHaveBeenCalledWith(0, APPLICATION_LIST_DEFAULT_LIMIT - 1);
  });

  it("sets cv_exists:true when existence is unknown (non-R2 URL)", async () => {
    mockCheckCvObjectExists.mockResolvedValue(undefined);
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data[0].cv_exists).toBe(true);
  });

  it("sets cv_exists:false when HeadObject confirms the R2 object is missing", async () => {
    mockCheckCvObjectExists.mockResolvedValue(false);
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest());
    const json = await response.json();
    expect(json.data[0].cv_exists).toBe(false);
  });

  it("returns null public_id when none can be resolved (does not coerce to empty string)", async () => {
    vi.mocked(resolvePublicIdReadOnly).mockResolvedValueOnce(null);
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data[0].public_id).toBeNull();
  });

  it("respects limit and offset query params", async () => {
    const chain = okWithCount([LIST_ITEM], 50);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest("limit=10&offset=20"));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.meta).toEqual({ limit: 10, offset: 20, total: 50 });
    expect(chain.range).toHaveBeenCalledWith(20, 29);
  });

  it("caps limit at APPLICATION_LIST_MAX_LIMIT", async () => {
    const chain = okWithCount([], 0);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest("limit=999"));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.meta.limit).toBe(APPLICATION_LIST_MAX_LIMIT);
    expect(chain.range).toHaveBeenCalledWith(
      0,
      APPLICATION_LIST_MAX_LIMIT - 1,
    );
  });

  it("applies search filter when q is present", async () => {
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const response = await GET(makeGetRequest("q=Acme"));
    expect(response.status).toBe(200);
    expect(chain.or).toHaveBeenCalledWith(
      'company.ilike."%Acme%",role.ilike."%Acme%",slug.ilike."%Acme%"',
    );
  });

  it("strips quotes and reserved filter chars from q before the or filter", async () => {
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const q = new URLSearchParams({ q: '"Acme":Corp' }).toString();
    const response = await GET(makeGetRequest(q));
    expect(response.status).toBe(200);
    expect(chain.or).toHaveBeenCalledWith(
      'company.ilike."%Acme Corp%",role.ilike."%Acme Corp%",slug.ilike."%Acme Corp%"',
    );
  });

  it("strips * from q so it cannot act as an ilike % wildcard", async () => {
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const q = new URLSearchParams({ q: "Acme*Corp" }).toString();
    const response = await GET(makeGetRequest(q));
    expect(response.status).toBe(200);
    expect(chain.or).toHaveBeenCalledWith(
      'company.ilike."%Acme Corp%",role.ilike."%Acme Corp%",slug.ilike."%Acme Corp%"',
    );
  });

  it("keeps apostrophes in q so names like O'Brien still match", async () => {
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const q = new URLSearchParams({ q: "O'Brien" }).toString();
    const response = await GET(makeGetRequest(q));
    expect(response.status).toBe(200);
    expect(chain.or).toHaveBeenCalledWith(
      `company.ilike."%O'Brien%",role.ilike."%O'Brien%",slug.ilike."%O'Brien%"`,
    );
  });

  it("skips the search filter when q is only reserved characters", async () => {
    const chain = okWithCount([LIST_ITEM], 1);
    mockCreateClient.mockResolvedValue(makeSupabaseClient([chain]));

    const q = new URLSearchParams({ q: '":.()*"' }).toString();
    const response = await GET(makeGetRequest(q));
    expect(response.status).toBe(200);
    expect(chain.or).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mockWithAuth.mockResolvedValue(authUnauthorized());
    const response = await GET(makeGetRequest());
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });
    const response = await GET(makeGetRequest());
    expect(response.status).toBe(429);
  });

  it("returns 500 when the query fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([dbError("boom")]),
    );
    const response = await GET(makeGetRequest());
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("boom");
  });
});
