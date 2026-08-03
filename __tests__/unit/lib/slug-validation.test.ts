/**
 * Unit tests for POST /api/slug body schema (slugReserveSchema).
 */
import { describe, it, expect } from "vitest";
import { APPLICATION_COMPANY_ROLE_MAX_LENGTH } from "@/lib/validation/application";
import { PROFILE_NAME_MAX_LENGTH } from "@/lib/validation/profile";
import {
  formatSlugReserveZodError,
  slugReserveSchema,
} from "@/lib/validation/slug";

const VALID_BODY = {
  company: "Volvo",
  role: "Software Engineer",
};

describe("slugReserveSchema", () => {
  it("accepts a minimal valid body", () => {
    const result = slugReserveSchema.safeParse(VALID_BODY);
    expect(result.success).toBe(true);
  });

  it("trims company and role", () => {
    const result = slugReserveSchema.safeParse({
      company: "  Volvo  ",
      role: "  Engineer  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe("Volvo");
      expect(result.data.role).toBe("Engineer");
    }
  });

  it("rejects missing or blank company/role", () => {
    expect(slugReserveSchema.safeParse({ role: "Engineer" }).success).toBe(
      false,
    );
    expect(slugReserveSchema.safeParse({ company: "Volvo" }).success).toBe(
      false,
    );
    expect(
      slugReserveSchema.safeParse({ company: "  ", role: "Engineer" }).success,
    ).toBe(false);
  });

  it("rejects non-object bodies (e.g. null)", () => {
    expect(slugReserveSchema.safeParse(null).success).toBe(false);
    expect(slugReserveSchema.safeParse("volvo").success).toBe(false);
  });

  it("accepts UUID excludeId and rejects non-UUID", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(
      slugReserveSchema.safeParse({ ...VALID_BODY, excludeId: id }).success,
    ).toBe(true);
    const bad = slugReserveSchema.safeParse({
      ...VALID_BODY,
      excludeId: "app-id-42",
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(formatSlugReserveZodError(bad.error)).toMatch(/UUID/i);
    }
  });

  it("coerces blank excludeId to undefined", () => {
    const result = slugReserveSchema.safeParse({
      ...VALID_BODY,
      excludeId: "  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.excludeId).toBeUndefined();
    }
  });

  it("accepts slugNamePosition start/end/null and rejects other values", () => {
    expect(
      slugReserveSchema.safeParse({
        ...VALID_BODY,
        slugNamePosition: "start",
      }).success,
    ).toBe(true);
    expect(
      slugReserveSchema.safeParse({
        ...VALID_BODY,
        slugNamePosition: null,
      }).success,
    ).toBe(true);
    expect(
      slugReserveSchema.safeParse({
        ...VALID_BODY,
        slugNamePosition: "middle",
      }).success,
    ).toBe(false);
  });

  it("rejects overlong names and unexpected keys", () => {
    expect(
      slugReserveSchema.safeParse({
        ...VALID_BODY,
        first_name: "A".repeat(PROFILE_NAME_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
    expect(
      slugReserveSchema.safeParse({
        ...VALID_BODY,
        company: "A".repeat(APPLICATION_COMPANY_ROLE_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
    const extra = slugReserveSchema.safeParse({
      ...VALID_BODY,
      user_id: "x",
    });
    expect(extra.success).toBe(false);
    if (!extra.success) {
      expect(formatSlugReserveZodError(extra.error)).toMatch(
        /unrecognized key/i,
      );
    }
  });
});
