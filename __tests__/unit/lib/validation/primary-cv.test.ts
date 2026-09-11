/**
 * Unit tests for primary CV write validation (F6-024).
 */
import { describe, it, expect } from "vitest";
import {
  PRIMARY_CV_LABEL_MAX_LENGTH,
  formatPrimaryCvZodError,
  primaryCvDeleteQuerySchema,
  primaryCvLabelSchema,
} from "@/lib/validation/primary-cv";

describe("primaryCvLabelSchema", () => {
  it("accepts a trimmed label", () => {
    const parsed = primaryCvLabelSchema.safeParse("  Master CV  ");
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toBe("Master CV");
  });

  it("maps empty / whitespace / missing to null", () => {
    expect(primaryCvLabelSchema.safeParse("").success).toBe(true);
    expect(primaryCvLabelSchema.safeParse("   ").success).toBe(true);
    expect(primaryCvLabelSchema.safeParse(null).success).toBe(true);
    expect(primaryCvLabelSchema.safeParse(undefined).success).toBe(true);
    for (const value of ["", "   ", null, undefined]) {
      const parsed = primaryCvLabelSchema.safeParse(value);
      expect(parsed.success).toBe(true);
      if (parsed.success) expect(parsed.data).toBeNull();
    }
  });

  it("rejects labels over the max length (no silent truncate)", () => {
    const tooLong = "a".repeat(PRIMARY_CV_LABEL_MAX_LENGTH + 1);
    const parsed = primaryCvLabelSchema.safeParse(tooLong);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(formatPrimaryCvZodError(parsed.error)).toMatch(/at most 120/i);
    }
  });

  it("rejects non-string values", () => {
    const parsed = primaryCvLabelSchema.safeParse(
      new File([""], "x.pdf", { type: "application/pdf" }),
    );
    expect(parsed.success).toBe(false);
  });
});

describe("primaryCvDeleteQuerySchema", () => {
  const validId = "11111111-1111-4111-8111-111111111111";

  it("accepts a trimmed UUID", () => {
    const parsed = primaryCvDeleteQuerySchema.safeParse({
      id: `  ${validId}  `,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.id).toBe(validId);
  });

  it("rejects missing / blank id", () => {
    for (const id of [null, undefined, "", "   "]) {
      const parsed = primaryCvDeleteQuerySchema.safeParse({ id });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(formatPrimaryCvZodError(parsed.error)).toMatch(/required/i);
      }
    }
  });

  it("rejects a non-UUID id", () => {
    const parsed = primaryCvDeleteQuerySchema.safeParse({ id: "not-a-uuid" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(formatPrimaryCvZodError(parsed.error)).toMatch(/valid UUID/i);
    }
  });
});
