import { describe, expect, it } from "vitest";
import { existingObjectMatchesUpload } from "@/lib/utils/upload-idempotency";

describe("existingObjectMatchesUpload", () => {
  const pdfFile = { size: 1024, type: "application/pdf" };

  it("accepts matching size and PDF content type", () => {
    expect(
      existingObjectMatchesUpload(
        { ContentLength: 1024, ContentType: "application/pdf" },
        pdfFile,
      ),
    ).toBe(true);
  });

  it("accepts content type with parameters", () => {
    expect(
      existingObjectMatchesUpload(
        { ContentLength: 1024, ContentType: "application/pdf; charset=binary" },
        pdfFile,
      ),
    ).toBe(true);
  });

  it("rejects size mismatch", () => {
    expect(
      existingObjectMatchesUpload(
        { ContentLength: 2048, ContentType: "application/pdf" },
        pdfFile,
      ),
    ).toBe(false);
  });

  it("rejects missing ContentLength", () => {
    expect(
      existingObjectMatchesUpload(
        { ContentLength: undefined, ContentType: "application/pdf" },
        pdfFile,
      ),
    ).toBe(false);
  });

  it("rejects non-PDF stored content type", () => {
    expect(
      existingObjectMatchesUpload(
        { ContentLength: 1024, ContentType: "application/octet-stream" },
        pdfFile,
      ),
    ).toBe(false);
  });
});
