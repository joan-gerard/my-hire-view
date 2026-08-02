import { describe, it, expect } from "vitest";
import {
  detectAllowedImageMime,
  extensionForImageMime,
} from "@/lib/utils/image";

/** Minimal JPEG: SOI + APP0-ish marker start. */
function jpegBytes(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

/** PNG signature + length(13) + "IHDR". */
function pngBytes(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // signature
    0x00, 0x00, 0x00, 0x0d, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
  ]);
}

/** RIFF + size + WEBP + VP8 . */
function webpBytes(fourCC: [number, number, number, number]): Uint8Array {
  return new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x10, 0x00, 0x00, 0x00, // size (dummy)
    0x57, 0x45, 0x42, 0x50, // WEBP
    ...fourCC,
  ]);
}

describe("detectAllowedImageMime", () => {
  it("detects JPEG from SOI magic", () => {
    expect(detectAllowedImageMime(jpegBytes())).toBe("image/jpeg");
    expect(detectAllowedImageMime(jpegBytes().buffer)).toBe("image/jpeg");
  });

  it("detects PNG when signature and IHDR are present", () => {
    expect(detectAllowedImageMime(pngBytes())).toBe("image/png");
  });

  it("detects WebP for VP8, VP8L, and VP8X chunks", () => {
    expect(
      detectAllowedImageMime(webpBytes([0x56, 0x50, 0x38, 0x20])),
    ).toBe("image/webp");
    expect(
      detectAllowedImageMime(webpBytes([0x56, 0x50, 0x38, 0x4c])),
    ).toBe("image/webp");
    expect(
      detectAllowedImageMime(webpBytes([0x56, 0x50, 0x38, 0x58])),
    ).toBe("image/webp");
  });

  it("rejects empty, truncated, and non-image payloads", () => {
    expect(detectAllowedImageMime(new Uint8Array([]))).toBeNull();
    expect(detectAllowedImageMime(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(detectAllowedImageMime(new TextEncoder().encode("%PDF-1.7"))).toBe(
      null,
    );
    expect(detectAllowedImageMime(new TextEncoder().encode("RIFF....WEBP"))).toBe(
      null,
    );
  });

  it("rejects PNG signature without IHDR and RIFF/WEBP without VP8*", () => {
    const pngNoIhdr = pngBytes();
    pngNoIhdr[12] = 0x00;
    expect(detectAllowedImageMime(pngNoIhdr)).toBeNull();

    expect(
      detectAllowedImageMime(webpBytes([0x41, 0x4e, 0x49, 0x4d])), // ANIM
    ).toBeNull();
  });
});

describe("extensionForImageMime", () => {
  it("maps mime to file extension", () => {
    expect(extensionForImageMime("image/jpeg")).toBe("jpg");
    expect(extensionForImageMime("image/png")).toBe("png");
    expect(extensionForImageMime("image/webp")).toBe("webp");
  });
});
