/**
 * Tests for DELETE /api/applications.
 *
 * Covers:
 * - Happy path: ownership check → R2 cleanup → row delete → 200.
 * - UUID validation for `id` query param.
 * - Fail closed: R2 cleanup failure → 500 and DB row left intact.
 * - 404 when missing or not owned.
 * - Auth / rate-limit guards; unexpected errors → 500.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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
  deleteApplicationCvIfTailored: mockDeleteCvIfOurs,
  checkCvObjectExists: vi.fn().mockResolvedValue(true),
  isOwnedTailoredCvUrl: vi.fn().mockReturnValue(true),
}));
vi.mock("@/lib/auth/ensure-public-id", () => ({
  ensureProfilePublicId: vi.fn(),
  resolvePublicIdReadOnly: vi.fn(),
}));
vi.mock("@/lib/utils/slug", () => ({
  SLUG_COLLISION_USER_MESSAGE: "slug taken",
  validateSlugForApplication: vi.fn(),
}));

import { DELETE } from "@/app/api/applications/route";
import { ok, dbError, makeSupabaseClient } from "../../helpers/supabase-mock";

const MOCK_USER = { id: "user-abc" };
const APP_ID = "22222222-2222-4222-8222-222222222222";

function makeDeleteRequest(id: string | null): NextRequest {
  const url =
    id === null
      ? "http://localhost/api/applications"
      : `http://localhost/api/applications?id=${encodeURIComponent(id)}`;
  return new NextRequest(url, { method: "DELETE" });
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

describe("DELETE /api/applications", () => {
  it("returns 200 and deletes the application on success", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({
          user_id: MOCK_USER.id,
          cv_url: "https://r2.example.com/cv.pdf",
          cv_type: "tailored",
        }),
        ok(null),
      ]),
    );

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(
      "https://r2.example.com/cv.pdf",
      "tailored",
      MOCK_USER.id,
    );
  });

  it("returns 400 when id is missing", async () => {
    const response = await DELETE(makeDeleteRequest(null));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Application ID is required");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when id is not a UUID", async () => {
    const response = await DELETE(makeDeleteRequest("app-42"));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Application ID must be a valid UUID");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 404 when the application is missing or not owned", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient([ok(null)]));

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(404);
    expect(mockDeleteCvIfOurs).not.toHaveBeenCalled();
  });

  it("returns 400 when the DB delete fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({
          user_id: MOCK_USER.id,
          cv_url: "https://r2.example.com/cv.pdf",
          cv_type: "tailored",
        }),
        dbError("delete failed"),
      ]),
    );

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(400);
  });

  it("returns 500 and skips DB delete when R2 cleanup fails", async () => {
    mockDeleteCvIfOurs.mockRejectedValue(new Error("R2 unavailable"));
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok({
          user_id: MOCK_USER.id,
          cv_url: "https://r2.example.com/cv.pdf",
          cv_type: "tailored",
        }),
      ]),
    );

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to delete CV file. Please try again.");
    // Only ownership select should have run — no delete chain.
    const client = await mockCreateClient.mock.results[0]?.value;
    expect(client.from).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 500 when an unexpected error occurs after auth", async () => {
    mockCreateClient.mockRejectedValue(new Error("supabase down"));

    const response = await DELETE(makeDeleteRequest(APP_ID));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to delete application");
  });
});
