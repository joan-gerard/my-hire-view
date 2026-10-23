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
  it("defaults to company then role", () => {
    expect(buildSlug("Volvo", "Engineer")).toBe("volvo-engineer");
    expect(buildSlug("Volvo", "Engineer", "company_role")).toBe(
      "volvo-engineer",
    );
  });

  it("puts role before company when order is role_company", () => {
    expect(buildSlug("Acme", "Software Engineer", "role_company")).toBe(
      "software-engineer-acme",
    );
  });

  it("handles a single non-empty segment", () => {
    expect(buildSlug("Volvo", "", "company_role")).toBe("volvo");
    expect(buildSlug("", "Engineer", "role_company")).toBe("engineer");
  });

  it("clamps long company+role combinations to SLUG_MAX_LENGTH", () => {
    const company = "a".repeat(80);
    const role = "b".repeat(80);
    const slug = buildSlug(company, role, "role_company");
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(validateSlugFormat(slug).ok).toBe(true);
  });

  it("does not leave a trailing hyphen when one side normalizes to empty", () => {
    expect(buildSlug("!!!", "Engineer", "company_role")).toBe("engineer");
    expect(buildSlug("Acme", "@@@", "role_company")).toBe("acme");
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

  it("returns false when the slug matches a role-company derived slug", () => {
    expect(
      isCustomSlug(
        "software-engineer-acme",
        "Acme",
        "Software Engineer",
        "role_company",
      ),
    ).toBe(false);
  });

  it("returns true when the saved slug differs from the derived value (F14-099)", () => {
    expect(isCustomSlug("my-custom-link", "Volvo", "Engineer")).toBe(true);
  });

  it("trims before comparing", () => {
    expect(isCustomSlug("  volvo-engineer  ", "Volvo", "Engineer")).toBe(false);
  });
});
