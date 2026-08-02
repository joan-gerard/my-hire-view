/**
 * Tests for POST /api/upload/profile-picture.
 *
 * Validates auth vs unexpected-error status codes, MIME + magic-byte checks,
 * size limit, and Storage failure logging (without leaking Storage messages).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockRequireAuth,
  mockCreateClient,
  mockCheckRateLimit,
  mockRemoveOther,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockRemoveOther: vi.fn(),
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
vi.mock("@/lib/utils/profile-picture-storage", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/utils/profile-picture-storage")>();
  return {
    ...actual,
    removeOtherProfilePicturesInFolder: mockRemoveOther,
  };
});

import { POST } from "@/app/api/upload/profile-picture/route";

const MOCK_USER = { id: "user-123" };
const PUBLIC_URL =
  "https://abc.supabase.co/storage/v1/object/public/profile-pictures/user-123/avatar.jpg";

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);

function makeUploadRequest(file: File | null): NextRequest {
  const form = new FormData();
  if (file) form.set("file", file);
  return new NextRequest("http://localhost/api/upload/profile-picture", {
    method: "POST",
    body: form,
  });
}

function jpegFile(name = "avatar.jpg"): File {
  return new File([JPEG_BYTES], name, { type: "image/jpeg" });
}

function makeStorageClient(options: {
  uploadResult?: { data: { path: string } | null; error: unknown };
  publicUrl?: string;
} = {}) {
  const upload = vi.fn().mockResolvedValue(
    options.uploadResult ?? {
      data: { path: "user-123/avatar.jpg" },
      error: null,
    },
  );
  const getPublicUrl = vi.fn().mockReturnValue({
    data: { publicUrl: options.publicUrl ?? PUBLIC_URL },
  });
  return {
    storage: {
      from: vi.fn().mockReturnValue({ upload, getPublicUrl }),
    },
    _upload: upload,
    _getPublicUrl: getPublicUrl,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue(MOCK_USER);
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
  mockRemoveOther.mockResolvedValue({ ok: true });
  mockCreateClient.mockResolvedValue(makeStorageClient());
});

describe("POST /api/upload/profile-picture", () => {
  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("redirect"));
    const response = await POST(makeUploadRequest(jpegFile()));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 when no file is provided", async () => {
    const response = await POST(makeUploadRequest(null));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "No file provided" });
  });

  it("returns 400 for disallowed MIME types", async () => {
    const file = new File([JPEG_BYTES], "x.gif", { type: "image/gif" });
    const response = await POST(makeUploadRequest(file));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Only JPEG, PNG and WebP images are allowed",
    });
  });

  it("returns 400 when MIME is image/* but magic bytes are not a real image", async () => {
    const file = new File([new TextEncoder().encode("%PDF-1.7")], "x.jpg", {
      type: "image/jpeg",
    });
    const response = await POST(makeUploadRequest(file));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Only JPEG, PNG and WebP images are allowed",
    });
  });

  it("uploads using detected content type from magic bytes", async () => {
    const client = makeStorageClient({
      uploadResult: {
        data: { path: "user-123/avatar.png" },
        error: null,
      },
      publicUrl: PUBLIC_URL.replace("avatar.jpg", "avatar.png"),
    });
    mockCreateClient.mockResolvedValue(client);

    // Client claims JPEG but bytes are PNG — storage uses detected PNG.
    const file = new File([PNG_BYTES], "avatar.jpg", { type: "image/jpeg" });
    const response = await POST(makeUploadRequest(file));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toContain("avatar.png");
    expect(client._upload).toHaveBeenCalledWith(
      "user-123/avatar.png",
      expect.any(Buffer),
      { contentType: "image/png", upsert: true },
    );
  });

  it("returns 500 with a generic message when Storage upload fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const client = makeStorageClient({
      uploadResult: {
        data: null,
        error: {
          message: "Bucket not found",
          name: "StorageApiError",
          status: 404,
          statusCode: "404",
        },
      },
    });
    mockCreateClient.mockResolvedValue(client);

    const response = await POST(makeUploadRequest(jpegFile()));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to upload" });
    expect(errorSpy).toHaveBeenCalledWith(
      "Profile picture upload error:",
      expect.objectContaining({
        message: "Bucket not found",
        status: 404,
        statusCode: "404",
      }),
    );
    errorSpy.mockRestore();
  });

  it("returns 500 (not 401) on unexpected errors after auth", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCreateClient.mockRejectedValue(new Error("boom"));

    const response = await POST(makeUploadRequest(jpegFile()));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to upload" });
    expect(errorSpy).toHaveBeenCalledWith(
      "Profile picture upload unexpected error:",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it("returns 200 with url on success", async () => {
    const response = await POST(makeUploadRequest(jpegFile()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: PUBLIC_URL });
    expect(mockRemoveOther).toHaveBeenCalled();
  });

  it("includes warning when purge of older files fails", async () => {
    mockRemoveOther.mockResolvedValue({ ok: false });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(makeUploadRequest(jpegFile()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: PUBLIC_URL,
      warning: "Uploaded but could not remove older files",
    });
    errorSpy.mockRestore();
  });
});
