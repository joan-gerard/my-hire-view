import { describe, expect, it, vi } from "vitest";
import {
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
    expect(messageForUploadFailure("cv", 409)).toMatch(/choose the file again/i);
    expect(messageForUploadFailure("cv", 429, "Too many requests.")).toMatch(
      /Too many/i,
    );
    expect(messageForUploadFailure("cv", 500, "internal detail")).toMatch(
      /couldn’t upload your CV/i,
    );
    expect(
      messageForUploadFailure("profile-picture", 500, "leak"),
    ).toMatch(/couldn’t upload your picture/i);
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

  it("builds a stable file signature", () => {
    const file = new File(["%PDF"], "cv.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "lastModified", { value: 123 });
    expect(getFileSignature(file)).toBe(`cv.pdf:${file.size}:123`);
  });
});
