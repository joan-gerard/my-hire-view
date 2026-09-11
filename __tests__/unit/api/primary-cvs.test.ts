/**
 * Tests for POST/DELETE /api/profile/primary-cvs schema validation (F6-024).
 *
 * Focus: clear 400s for invalid label / id before storage or DB work.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { authOk, authUnauthorized } from "../../helpers/auth-mock";
import { ok, okWithCount, makeSupabaseClient } from "../../helpers/supabase-mock";
import { PRIMARY_CV_LABEL_MAX_LENGTH } from "@/lib/validation/primary-cv";

const {
  mockWithAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockDeleteCvIfOurs,
  mockGetR2PublicBaseUrl,
  mockGetR2Bucket,
  mockGetR2S3Client,
  mockSend,
} = vi.hoisted(() => ({
  mockWithAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockDeleteCvIfOurs: vi.fn(),
  mockGetR2PublicBaseUrl: vi.fn(),
  mockGetR2Bucket: vi.fn(),
  mockGetR2S3Client: vi.fn(),
  mockSend: vi.fn(),
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
  deleteCvIfOurs: mockDeleteCvIfOurs,
}));
vi.mock("@/lib/storage/r2-client", () => ({
  getR2PublicBaseUrl: mockGetR2PublicBaseUrl,
  getR2Bucket: mockGetR2Bucket,
  getR2S3Client: mockGetR2S3Client,
}));

import { DELETE, POST } from "@/app/api/profile/primary-cvs/route";

const MOCK_USER = { id: "user-abc" };
const PRIMARY_ID = "11111111-1111-4111-8111-111111111111";
const PDF_BYTES = new Uint8Array([
  0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34,
]);
const PUBLIC_BASE = "https://files.example.com";
const BUCKET = "cvs";

function pdfFile(): File {
  return new File([PDF_BYTES], "cv.pdf", { type: "application/pdf" });
}

function makePostRequest(fields: {
  file?: File | null;
  label?: string;
}): NextRequest {
  const form = new FormData();
  if (fields.file) form.set("file", fields.file);
  if (fields.label !== undefined) form.set("label", fields.label);
  return new NextRequest("http://localhost/api/profile/primary-cvs", {
    method: "POST",
    body: form,
  });
}

function makeDeleteRequest(id: string | null): NextRequest {
  const url =
    id === null
      ? "http://localhost/api/profile/primary-cvs"
      : `http://localhost/api/profile/primary-cvs?id=${encodeURIComponent(id)}`;
  return new NextRequest(url, { method: "DELETE" });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockWithAuth.mockResolvedValue(authOk(MOCK_USER));
  mockCheckRateLimit.mockResolvedValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
  mockGetR2PublicBaseUrl.mockReturnValue(PUBLIC_BASE);
  mockGetR2Bucket.mockReturnValue(BUCKET);
  mockSend.mockResolvedValue({});
  mockGetR2S3Client.mockReturnValue({ send: mockSend });
  mockDeleteCvIfOurs.mockResolvedValue(undefined);
});

describe("POST /api/profile/primary-cvs", () => {
  it("returns 401 when unauthenticated", async () => {
    mockWithAuth.mockResolvedValue(authUnauthorized());
    const response = await POST(makePostRequest({ file: pdfFile() }));
    expect(response.status).toBe(401);
  });

  it("returns 400 when label exceeds max length", async () => {
    const response = await POST(
      makePostRequest({
        file: pdfFile(),
        label: "a".repeat(PRIMARY_CV_LABEL_MAX_LENGTH + 1),
      }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: `Label must be at most ${PRIMARY_CV_LABEL_MAX_LENGTH} characters`,
    });
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("stores a trimmed label on success", async () => {
    const inserted = {
      id: PRIMARY_ID,
      user_id: MOCK_USER.id,
      url: `${PUBLIC_BASE}/cvs/${MOCK_USER.id}/primary/${PRIMARY_ID}.pdf`,
      filename: "cv.pdf",
      label: "Master CV",
      created_at: "2026-01-01T00:00:00Z",
    };
    const insertChain = ok(inserted);
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([okWithCount([], 0), insertChain]),
    );

    const response = await POST(
      makePostRequest({ file: pdfFile(), label: "  Master CV  " }),
    );
    expect(response.status).toBe(201);
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Master CV" }),
    );
  });
});

describe("DELETE /api/profile/primary-cvs", () => {
  it("returns 400 when id is missing", async () => {
    const response = await DELETE(makeDeleteRequest(null));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Primary CV id is required",
    });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 400 when id is not a UUID", async () => {
    const response = await DELETE(makeDeleteRequest("not-a-uuid"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Primary CV id must be a valid UUID",
    });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns 200 and deletes when id is valid", async () => {
    const existing = {
      id: PRIMARY_ID,
      user_id: MOCK_USER.id,
      url: `${PUBLIC_BASE}/cvs/${MOCK_USER.id}/primary/${PRIMARY_ID}.pdf`,
      filename: "cv.pdf",
      label: null,
      created_at: "2026-01-01T00:00:00Z",
    };
    mockCreateClient.mockResolvedValue(
      makeSupabaseClient([
        ok(existing),
        okWithCount([], 2),
        ok(null),
      ]),
    );

    const response = await DELETE(makeDeleteRequest(PRIMARY_ID));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      applications_affected: 2,
    });
    expect(mockDeleteCvIfOurs).toHaveBeenCalledWith(existing.url, MOCK_USER.id);
  });
});
