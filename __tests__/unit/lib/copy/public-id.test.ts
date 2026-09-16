import { describe, expect, it } from "vitest";
import {
  formatPublicPathExample,
  PUBLIC_ID_HELP,
  PUBLIC_ID_LABEL,
  PUBLIC_ID_MISSING,
  SHARE_URL_PREVIEW_HELP,
  SHARE_URL_PREVIEW_LABEL,
} from "@/lib/copy/public-id";

describe("public-id copy (F19-046)", () => {
  it("exposes stable labels and help strings", () => {
    expect(PUBLIC_ID_LABEL).toBe("Public id");
    expect(PUBLIC_ID_HELP.length).toBeGreaterThan(20);
    expect(PUBLIC_ID_MISSING.toLowerCase()).toContain("not ready");
    expect(SHARE_URL_PREVIEW_LABEL).toBe("Share link preview");
    expect(SHARE_URL_PREVIEW_HELP.toLowerCase()).toContain("publish");
  });

  it("formats a path-only example with public id and slug", () => {
    expect(formatPublicPathExample("k7x2m9ab")).toBe(
      "/view/k7x2m9ab/company-role",
    );
    expect(formatPublicPathExample("k7x2m9ab", "acme-engineer")).toBe(
      "/view/k7x2m9ab/acme-engineer",
    );
  });
});
