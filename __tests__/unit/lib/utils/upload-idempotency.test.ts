import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import {
  existingObjectMatchesUpload,
  sha256Hex,
} from "@/lib/utils/upload-idempotency";

describe("sha256Hex", () => {
  it("hashes bytes as lowercase hex", () => {
    const body = Buffer.from("%PDF-1.4");
    expect(sha256Hex(body)).toBe(
      createHash("sha256").update(body).digest("hex"),
    );
  });
});

describe("existingObjectMatchesUpload", () => {
  const digest = "a".repeat(64);
  const pdfFile = { size: 1024, type: "application/pdf" };
  const matchingHead = {
    ContentLength: 1024,
    ContentType: "application/pdf",
    Metadata: { sha256: digest },
  };

  it("accepts matching size, PDF content type, and digest", () => {
    expect(existingObjectMatchesUpload(matchingHead, pdfFile, digest)).toBe(
      true,
    );
  });

  it("accepts content type with parameters", () => {
    expect(
      existingObjectMatchesUpload(
        {
          ...matchingHead,
          ContentType: "application/pdf; charset=binary",
        },
        pdfFile,
        digest,
      ),
    ).toBe(true);
  });

  it("accepts metadata key casing variants", () => {
    expect(
      existingObjectMatchesUpload(
        {
          ...matchingHead,
          Metadata: { SHA256: digest.toUpperCase() },
        },
        pdfFile,
        digest,
      ),
    ).toBe(true);
  });

  it("rejects size mismatch", () => {
    expect(
      existingObjectMatchesUpload(
        { ...matchingHead, ContentLength: 2048 },
        pdfFile,
        digest,
      ),
    ).toBe(false);
  });

  it("rejects missing ContentLength", () => {
    expect(
      existingObjectMatchesUpload(
        { ...matchingHead, ContentLength: undefined },
        pdfFile,
        digest,
      ),
    ).toBe(false);
  });

  it("rejects non-PDF stored content type", () => {
    expect(
      existingObjectMatchesUpload(
        { ...matchingHead, ContentType: "application/octet-stream" },
        pdfFile,
        digest,
      ),
    ).toBe(false);
  });

  it("rejects digest mismatch", () => {
    expect(
      existingObjectMatchesUpload(matchingHead, pdfFile, "b".repeat(64)),
    ).toBe(false);
  });

  it("rejects missing digest metadata (legacy size/MIME-only objects)", () => {
    expect(
      existingObjectMatchesUpload(
        {
          ContentLength: 1024,
          ContentType: "application/pdf",
        },
        pdfFile,
        digest,
      ),
    ).toBe(false);
  });
});
