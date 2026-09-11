/**
 * Tests for POST /api/upload (tailored CV).
 *
 * Focus: unexpected failures go through `handleApiError` with log-only
 * meta (userId, size, storage status) and generic client messages (F5-056).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { authOk, authUnauthorized } from "../../helpers/auth-mock";

const {
  mockWithAuth,
  mockCheckRateLimit,
  mockRateLimitAsync,
  mockTryAcquire,
  mockRelease,
  mockGetR2PublicBaseUrl,
  mockGetR2Bucket,
  mockGetR2S3Client,
} = vi.hoisted(() => ({
  mockWithAuth: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockRateLimitAsync: vi.fn(),
  mockTryAcquire: vi.fn(),
  mockRelease: vi.fn(),
  mockGetR2PublicBaseUrl: vi.fn(),
  mockGetR2Bucket: vi.fn(),
  mockGetR2S3Client: vi.fn(),
}));

vi.mock("@/lib/api/with-auth", () => ({ withAuth: mockWithAuth }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  rateLimitAsync: mockRateLimitAsync,
  CV_UPLOAD_RATE_LIMIT: { limit: 10, windowMs: 60_000 },
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
  tryAcquireUserUploadSlot: mockTryAcquire,
  releaseUserUploadSlot: mockRelease,
}));
vi.mock("@/lib/storage/r2-client", () => ({
  getR2PublicBaseUrl: mockGetR2PublicBaseUrl,
  getR2Bucket: mockGetR2Bucket,
  getR2S3Client: mockGetR2S3Client,
}));

import { POST } from "@/app/api/upload/route";

const MOCK_USER = { id: "user-123" };
const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
const PUBLIC_BASE = "https://files.example.com";
const BUCKET = "cvs";

function s3Error(name: string, httpStatusCode: number): Error {
  const err = new Error(name);
  err.name = name;
  Object.assign(err, { $metadata: { httpStatusCode } });
  return err;
}

function pdfFile(): File {
  return new File([PDF_BYTES], "cv.pdf", { type: "application/pdf" });
}

function makeUploadRequest(
  file: File | null,
  key = "idem-key-1",
): NextRequest {
  const form = new FormData();
  if (file) form.set("file", file);
  if (key) form.set("idempotency_key", key);
  return new NextRequest("http://localhost/api/upload", {
    method: "POST",
    body: form,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockWithAuth.mockResolvedValue(authOk(MOCK_USER));
  mockCheckRateLimit.mockResolvedValue({
    success: true,
    remaining: 9,
    resetAt: Date.now() + 60_000,
  });
  mockRateLimitAsync.mockResolvedValue({
    success: true,
    remaining: 9,
    resetAt: Date.now() + 60_000,
  });
  mockTryAcquire.mockReturnValue(true);
  mockGetR2PublicBaseUrl.mockReturnValue(PUBLIC_BASE);
  mockGetR2Bucket.mockReturnValue(BUCKET);
  mockGetR2S3Client.mockReturnValue({ send: vi.fn() });
});

describe("POST /api/upload", () => {
  it("returns 401 when unauthenticated", async () => {
    mockWithAuth.mockResolvedValue(authUnauthorized());
    const response = await POST(makeUploadRequest(pdfFile()));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it("returns 500 via handleApiError when R2 is not configured", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const cause = new Error("Missing R2_PUBLIC_BASE_URL");
    mockGetR2PublicBaseUrl.mockImplementation(() => {
      throw cause;
    });

    const response = await POST(makeUploadRequest(pdfFile()));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "File upload is not configured",
    });
    expect(errorSpy).toHaveBeenCalledWith("POST /api/upload R2 config", cause);
    errorSpy.mockRestore();
  });

  it("returns 500 with log-only meta when HeadObject fails unexpectedly", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const headErr = s3Error("InternalError", 500);
    const send = vi.fn().mockRejectedValue(headErr);
    mockGetR2S3Client.mockReturnValue({ send });

    const file = pdfFile();
    const response = await POST(makeUploadRequest(file));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to verify upload state" });
    expect(json).not.toHaveProperty("userId");
    expect(json).not.toHaveProperty("storageStatus");
    expect(errorSpy).toHaveBeenCalledWith(
      "POST /api/upload HeadObject",
      headErr,
      {
        userId: MOCK_USER.id,
        size: file.size,
        storageStatus: 500,
      },
    );
    expect(mockRelease).toHaveBeenCalledWith(MOCK_USER.id);
    errorSpy.mockRestore();
  });

  it("returns 500 with log-only meta when PutObject fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const notFound = s3Error("NotFound", 404);
    const putErr = s3Error("AccessDenied", 403);
    const send = vi
      .fn()
      .mockRejectedValueOnce(notFound)
      .mockRejectedValueOnce(putErr);
    mockGetR2S3Client.mockReturnValue({ send });

    const file = pdfFile();
    const response = await POST(makeUploadRequest(file));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to upload file" });
    expect(json).not.toHaveProperty("userId");
    expect(errorSpy).toHaveBeenCalledWith("POST /api/upload", putErr, {
      userId: MOCK_USER.id,
      size: file.size,
      storageStatus: 403,
    });
    expect(mockRelease).toHaveBeenCalledWith(MOCK_USER.id);
    errorSpy.mockRestore();
  });

  it("returns 500 when PutObject rejects with null", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi
      .fn()
      .mockRejectedValueOnce(s3Error("NotFound", 404))
      .mockRejectedValueOnce(null);
    mockGetR2S3Client.mockReturnValue({ send });

    const file = pdfFile();
    const response = await POST(makeUploadRequest(file));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to upload file" });
    expect(errorSpy).toHaveBeenCalledWith("POST /api/upload", null, {
      userId: MOCK_USER.id,
      size: file.size,
    });
    expect(mockRelease).toHaveBeenCalledWith(MOCK_USER.id);
    errorSpy.mockRestore();
  });

  it("returns 200 with a public URL on a new upload", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(s3Error("NotFound", 404))
      .mockResolvedValueOnce({});
    mockGetR2S3Client.mockReturnValue({ send });

    const file = pdfFile();
    const response = await POST(makeUploadRequest(file, "abc12345"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: `${PUBLIC_BASE}/cvs/${MOCK_USER.id}/tailored/abc12345.pdf`,
      idempotent: false,
    });
    expect(mockRelease).toHaveBeenCalledWith(MOCK_USER.id);
  });
});
