import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  getFileContentDigest,
  getFileSignature,
  resolveCvUploadIdempotencyKey,
} from "@/lib/utils/cv-upload-client-key";
import {
  messageForUploadFailure,
  messageForUploadNetworkError,
} from "@/lib/utils/upload-form-messages";

describe("messageForUploadFailure", () => {
  it("keeps friendly server 400 text when present", () => {
    expect(
      messageForUploadFailure("cv", 400, "Only PDF files are allowed"),
    ).toBe("Only PDF files are allowed");
  });

  it("falls back for 400 without server text", () => {
    expect(messageForUploadFailure("cv", 400, null)).toMatch(/PDF/i);
    expect(messageForUploadFailure("profile-picture", 400, "")).toMatch(
      /JPEG|PNG|WebP/i,
    );
  });

  it("maps 401 / 409 / 429 / 500 to Save-friendly copy", () => {
    expect(messageForUploadFailure("cv", 401)).toMatch(/session expired/i);
    expect(messageForUploadFailure("cv", 409)).toMatch(/try saving again/i);
    expect(
      messageForUploadFailure("cv", 429, "Too many requests. Please try again later."),
    ).toBe("Too many uploads. Please wait a moment and try again.");
    expect(messageForUploadFailure("cv", 500, "internal detail")).toMatch(
      /couldn’t upload your CV/i,
    );
    expect(
      messageForUploadFailure("profile-picture", 500, "leak"),
    ).toMatch(/couldn’t upload your picture/i);
  });

  it("uses 400-style fallback for other non-5xx statuses", () => {
    expect(messageForUploadFailure("cv", 403, null)).toMatch(/PDF/i);
    expect(messageForUploadFailure("cv", 413, "")).toMatch(/PDF/i);
    expect(
      messageForUploadFailure("profile-picture", 422, "Unsupported type"),
    ).toBe("Unsupported type");
    expect(messageForUploadFailure("cv", 404, "  ")).toMatch(/PDF/i);
    // Must not tell the user to "try again in a moment" for client errors.
    expect(messageForUploadFailure("cv", 403)).not.toMatch(/in a moment/i);
  });

  it("maps network errors", () => {
    expect(messageForUploadNetworkError("cv")).toMatch(/Network error/i);
    expect(messageForUploadNetworkError("profile-picture")).toMatch(
      /Network error/i,
    );
  });
});

describe("resolveCvUploadIdempotencyKey (F8-063)", () => {
  it("reuses the current key when the file did not change", () => {
    const createKey = vi.fn(() => "new-key");
    expect(
      resolveCvUploadIdempotencyKey("same-key", false, createKey),
    ).toBe("same-key");
    expect(createKey).not.toHaveBeenCalled();
  });

  it("mints a new key when the file changed", () => {
    const createKey = vi.fn(() => "rotated");
    expect(
      resolveCvUploadIdempotencyKey("old-key", true, createKey),
    ).toBe("rotated");
    expect(createKey).toHaveBeenCalledOnce();
  });

  it("mints a key when none exists yet", () => {
    const createKey = vi.fn(() => "first");
    expect(resolveCvUploadIdempotencyKey(null, false, createKey)).toBe("first");
    expect(createKey).toHaveBeenCalledOnce();
  });
});

describe("getFileSignature (content digest)", () => {
  it("uses SHA-256 content so same metadata with different bytes differ", async () => {
    const a = new File(["%PDF-a"], "cv.pdf", { type: "application/pdf" });
    const b = new File(["%PDF-b"], "cv.pdf", { type: "application/pdf" });
    Object.defineProperty(a, "lastModified", { value: 123 });
    Object.defineProperty(b, "lastModified", { value: 123 });

    const digestA = await getFileContentDigest(a);
    const expectedA = createHash("sha256").update("%PDF-a").digest("hex");
    expect(digestA).toBe(expectedA);

    const sigA = await getFileSignature(a);
    const sigB = await getFileSignature(b);
    expect(sigA).not.toBe(sigB);
    expect(sigA).toBe(`${a.size}:${digestA}`);
  });

  it("matches for identical content regardless of lastModified", async () => {
    const a = new File(["%PDF-same"], "a.pdf", { type: "application/pdf" });
    const b = new File(["%PDF-same"], "b.pdf", { type: "application/pdf" });
    Object.defineProperty(a, "lastModified", { value: 1 });
    Object.defineProperty(b, "lastModified", { value: 999 });
    // Same bytes + size → same signature (name is not part of identity).
    expect(await getFileSignature(a)).toBe(await getFileSignature(b));
  });
});
