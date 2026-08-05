import { describe, it, expect } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-next-path";

describe("safeNextPath", () => {
  it("returns /admin for null, empty, or non-relative paths", () => {
    expect(safeNextPath(null)).toBe("/admin");
    expect(safeNextPath("")).toBe("/admin");
    expect(safeNextPath("https://evil.com")).toBe("/admin");
    expect(safeNextPath("admin")).toBe("/admin");
  });

  it("allows same-origin relative paths", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/profile")).toBe("/admin/profile");
    expect(safeNextPath("/admin/new?tab=cv")).toBe("/admin/new?tab=cv");
  });

  it("rejects protocol-relative open redirects", () => {
    expect(safeNextPath("//evil.com")).toBe("/admin");
    expect(safeNextPath("//evil.com/phish")).toBe("/admin");
  });

  it("rejects backslash authority tricks (A2-016)", () => {
    expect(safeNextPath("/\\evil.com")).toBe("/admin");
    expect(safeNextPath("/\\evil.com/phish")).toBe("/admin");
    expect(safeNextPath("\\evil.com")).toBe("/admin");
    expect(safeNextPath("/admin\\..\\evil")).toBe("/admin");
  });

  it("rejects ASCII control characters that URL parsers strip", () => {
    expect(safeNextPath("/\tevil.com")).toBe("/admin");
    expect(safeNextPath("/\revil.com")).toBe("/admin");
    expect(safeNextPath("/\nevil.com")).toBe("/admin");
    expect(safeNextPath("/admin\n/profile")).toBe("/admin");
    expect(safeNextPath("/\u0000admin")).toBe("/admin");
    // Percent-decoded by URLSearchParams before safeNextPath runs
    expect(safeNextPath(decodeURIComponent("/%09evil.com"))).toBe("/admin");
    expect(safeNextPath(decodeURIComponent("/%0d%0aLocation:%20https://evil.com"))).toBe(
      "/admin",
    );
  });
});
