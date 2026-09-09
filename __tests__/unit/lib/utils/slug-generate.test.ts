import { describe, it, expect } from "vitest";
import {
  validateSlugFormat,
  generateSlug,
  buildSlug,
  isCustomSlug,
  SLUG_MAX_LENGTH,
} from "@/lib/utils/slug-generate";

// ---------------------------------------------------------------------------
// validateSlugFormat
// ---------------------------------------------------------------------------
describe("validateSlugFormat", () => {
  it("rejects an empty string", () => {
    expect(validateSlugFormat("")).toEqual({
      ok: false,
      error: "Slug is required",
    });
  });

  it("rejects a string that is only whitespace", () => {
    expect(validateSlugFormat("   ")).toEqual({
      ok: false,
      error: "Slug is required",
    });
  });

  it("rejects a slug that exceeds the max length", () => {
    const long = "a".repeat(SLUG_MAX_LENGTH + 1);
    const result = validateSlugFormat(long);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain(
      `${SLUG_MAX_LENGTH} characters`,
    );
  });

  it("accepts a slug exactly at the max length", () => {
    // Build "aaa...a-aaa...a" of exactly SLUG_MAX_LENGTH chars.
    // 64 'a' chars + 1 hyphen + 63 'a' chars = 128 chars — a valid format.
    const slug = "a".repeat(64) + "-" + "a".repeat(SLUG_MAX_LENGTH - 65);
    expect(slug.length).toBe(SLUG_MAX_LENGTH);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("rejects uppercase letters", () => {
    expect(validateSlugFormat("Volvo-Engineer")).toEqual({
      ok: false,
      error: expect.stringContaining("lowercase"),
    });
  });

  it("rejects spaces", () => {
    expect(validateSlugFormat("volvo engineer")).toEqual({
      ok: false,
      error: expect.stringContaining("lowercase"),
    });
  });

  it("rejects a slug with a trailing hyphen", () => {
    expect(validateSlugFormat("volvo-")).toEqual({
      ok: false,
      error: expect.stringContaining("lowercase"),
    });
  });

  it("rejects a slug with a leading hyphen", () => {
    expect(validateSlugFormat("-volvo")).toEqual({
      ok: false,
      error: expect.stringContaining("lowercase"),
    });
  });

  it("rejects consecutive hyphens", () => {
    expect(validateSlugFormat("volvo--engineer")).toEqual({
      ok: false,
      error: expect.stringContaining("lowercase"),
    });
  });

  it("rejects special characters", () => {
    expect(validateSlugFormat("volvo_engineer")).toEqual({
      ok: false,
      error: expect.stringContaining("lowercase"),
    });
  });

  it("accepts a simple lowercase word", () => {
    expect(validateSlugFormat("volvo")).toEqual({ ok: true });
  });

  it("accepts a hyphen-separated slug", () => {
    expect(validateSlugFormat("volvo-software-engineer")).toEqual({ ok: true });
  });

  it("accepts a slug with numbers", () => {
    expect(validateSlugFormat("acme-engineer-2024")).toEqual({ ok: true });
  });

  it("trims surrounding whitespace before validating", () => {
    // Leading/trailing whitespace is trimmed internally
    expect(validateSlugFormat("  volvo  ")).toEqual({ ok: true });
  });
});

// ---------------------------------------------------------------------------
// generateSlug
// ---------------------------------------------------------------------------
describe("generateSlug", () => {
  it("produces a lowercase hyphen-separated slug from company and role", () => {
    expect(generateSlug("Volvo", "Software Engineer")).toBe(
      "volvo-software-engineer",
    );
  });

  it("strips special characters", () => {
    expect(generateSlug("Acme, Inc.", "Senior Dev!")).toBe(
      "acme-inc-senior-dev",
    );
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("Big  Corp", "Data  Analyst")).toBe(
      "big-corp-data-analyst",
    );
  });

  it("removes leading and trailing hyphens", () => {
    // A company with only special characters collapses to nothing; the
    // leading/trailing hyphens that would result are stripped.
    const slug = generateSlug("---", "engineer");
    expect(slug).not.toMatch(/^-|-$/);
  });

  it("handles empty strings gracefully", () => {
    const slug = generateSlug("", "");
    expect(slug).toBe("");
  });

  it("handles numeric company and role", () => {
    expect(generateSlug("42", "5g")).toBe("42-5g");
  });

  it("clamps output to SLUG_MAX_LENGTH", () => {
    const company = "a".repeat(100);
    const role = "b".repeat(100);
    const slug = generateSlug(company, role);
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("does not leave a trailing hyphen after clamping", () => {
    // Construct input so the uncapped slug would end near a hyphen boundary at max length.
    const company = "a".repeat(SLUG_MAX_LENGTH - 1);
    const role = "bb";
    const slug = generateSlug(company, role);
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug).not.toMatch(/-$/);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildSlug
// ---------------------------------------------------------------------------
describe("buildSlug", () => {
  it("returns the base slug when position is null", () => {
    expect(buildSlug("Volvo", "Engineer", "John", "Doe", null)).toBe(
      "volvo-engineer",
    );
  });

  it("returns the base slug when position is undefined", () => {
    expect(buildSlug("Volvo", "Engineer")).toBe("volvo-engineer");
  });

  it("prepends the name slug when position is 'start'", () => {
    expect(buildSlug("Volvo", "Engineer", "John", "Doe", "start")).toBe(
      "john-doe-volvo-engineer",
    );
  });

  it("appends the name slug when position is 'end'", () => {
    expect(buildSlug("Volvo", "Engineer", "John", "Doe", "end")).toBe(
      "volvo-engineer-john-doe",
    );
  });

  it("uses only first name when last name is absent (start)", () => {
    expect(buildSlug("Volvo", "Engineer", "John", null, "start")).toBe(
      "john-volvo-engineer",
    );
  });

  it("uses only last name when first name is absent (end)", () => {
    expect(buildSlug("Volvo", "Engineer", null, "Doe", "end")).toBe(
      "volvo-engineer-doe",
    );
  });

  it("falls back to base slug when both names are empty strings (start)", () => {
    expect(buildSlug("Volvo", "Engineer", "", "", "start")).toBe(
      "volvo-engineer",
    );
  });

  it("falls back to base slug when both names are null (end)", () => {
    expect(buildSlug("Volvo", "Engineer", null, null, "end")).toBe(
      "volvo-engineer",
    );
  });

  it("clamps name+company+role combinations to SLUG_MAX_LENGTH", () => {
    const company = "a".repeat(80);
    const role = "b".repeat(80);
    const first = "c".repeat(40);
    const last = "d".repeat(40);
    const slug = buildSlug(company, role, first, last, "start");
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("preserves the name segment when clamping a long start slug (F14-033)", () => {
    const company = "a".repeat(100);
    const role = "b".repeat(100);
    const first = "jane";
    const last = "doe";
    const slug = buildSlug(company, role, first, last, "start");
    expect(slug.startsWith("jane-doe-")).toBe(true);
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(validateSlugFormat(slug).ok).toBe(true);
    // Pre-clamp of company+role alone would have been 128 chars; name must still appear.
    expect(generateSlug(company, role).length).toBe(SLUG_MAX_LENGTH);
  });

  it("preserves the name segment when clamping a long end slug (F14-033)", () => {
    const company = "a".repeat(100);
    const role = "b".repeat(100);
    const first = "jane";
    const last = "doe";
    const slug = buildSlug(company, role, first, last, "end");
    expect(slug.endsWith("-jane-doe")).toBe(true);
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("returns a clamped name-only slug when the name alone fills the max length", () => {
    const longFirst = "n".repeat(SLUG_MAX_LENGTH + 10);
    const slug = buildSlug("Acme", "Engineer", longFirst, null, "start");
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug.startsWith("n")).toBe(true);
    expect(slug.includes("acme")).toBe(false);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("does not leave a trailing hyphen when company/role normalize to empty (start)", () => {
    const slug = buildSlug("!!!", "@@@", "john", "doe", "start");
    expect(slug).toBe("john-doe");
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("does not leave a leading hyphen when company/role normalize to empty (end)", () => {
    const slug = buildSlug("!!!", "@@@", "john", "doe", "end");
    expect(slug).toBe("john-doe");
    expect(validateSlugFormat(slug).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isCustomSlug
// ---------------------------------------------------------------------------
describe("isCustomSlug", () => {
  it("returns false for an empty slug", () => {
    expect(isCustomSlug("", "Volvo", "Engineer")).toBe(false);
  });

  it("returns false when the slug matches the derived company-role slug", () => {
    expect(isCustomSlug("volvo-engineer", "Volvo", "Engineer")).toBe(false);
  });

  it("returns false when the slug matches a name-in-URL derived slug", () => {
    expect(
      isCustomSlug("john-doe-volvo-engineer", "Volvo", "Engineer", "John", "Doe", "start"),
    ).toBe(false);
  });

  it("returns true when the saved slug differs from the derived value (F14-099)", () => {
    expect(
      isCustomSlug("my-custom-link", "Volvo", "Engineer", "John", "Doe", null),
    ).toBe(true);
  });

  it("trims before comparing", () => {
    expect(isCustomSlug("  volvo-engineer  ", "Volvo", "Engineer")).toBe(false);
  });
});
