/**
 * Unit tests for application create Zod schema (POST /api/applications body).
 */
import { describe, it, expect } from "vitest";
import {
  APPLICATION_COMPANY_ROLE_MAX_LENGTH,
  APPLICATION_CV_FILENAME_MAX_LENGTH,
  applicationCreateSchema,
  applicationUpdateSchema,
  formatApplicationCreateZodError,
  formatApplicationUpdateZodError,
} from "@/lib/validation/application";
import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from "@/lib/validation/profile";
import { SLUG_MAX_LENGTH } from "@/lib/utils/slug-generate";

const VALID_BODY = {
  company: "Volvo",
  role: "Software Engineer",
  slug: "volvo-software-engineer",
  cv_url: "https://r2.example.com/cv.pdf",
  video_url: "https://youtube.com/watch?v=abc",
};

describe("applicationCreateSchema", () => {
  it("accepts a minimal valid body", () => {
    const result = applicationCreateSchema.safeParse(VALID_BODY);
    expect(result.success).toBe(true);
  });

  it("trims required strings and URLs", () => {
    const result = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      company: "  Volvo  ",
      slug: "  volvo-software-engineer  ",
      cv_url: "  https://r2.example.com/cv.pdf  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe("Volvo");
      expect(result.data.slug).toBe("volvo-software-engineer");
      expect(result.data.cv_url).toBe("https://r2.example.com/cv.pdf");
    }
  });

  it("rejects missing required fields", () => {
    const result = applicationCreateSchema.safeParse({
      company: "Volvo",
      role: "Engineer",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatApplicationCreateZodError(result.error)).toMatch(
        /required|Slug|CV URL|Video URL/i,
      );
    }
  });

  it("rejects blank required strings", () => {
    expect(
      applicationCreateSchema.safeParse({ ...VALID_BODY, company: "  " })
        .success,
    ).toBe(false);
    expect(
      applicationCreateSchema.safeParse({ ...VALID_BODY, role: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid slug format", () => {
    const result = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      slug: "Volvo-Engineer",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatApplicationCreateZodError(result.error)).toMatch(
        /lowercase|hyphen/i,
      );
    }
  });

  it("rejects overlong slug", () => {
    const result = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      slug: "a".repeat(SLUG_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-http(s) and overlong URLs", () => {
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        video_url: "ftp://example.com/video",
      }).success,
    ).toBe(false);
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        portfolio_url: "not-a-url",
      }).success,
    ).toBe(false);
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        cv_url: `https://example.com/${"x".repeat(PROFILE_URL_MAX_LENGTH)}`,
      }).success,
    ).toBe(false);
  });

  it("coerces blank optional URLs to null", () => {
    const result = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      portfolio_url: "  ",
      linkedin_url: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.portfolio_url).toBeNull();
      expect(result.data.linkedin_url).toBeNull();
    }
  });

  it("rejects unexpected keys", () => {
    const result = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      user_id: "someone-else",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatApplicationCreateZodError(result.error)).toMatch(
        /unrecognized key/i,
      );
    }
  });

  it("requires primary_cv_id UUID when cv_type is primary", () => {
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        cv_type: "primary",
      }).success,
    ).toBe(false);

    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        cv_type: "primary",
        primary_cv_id: "not-a-uuid",
      }).success,
    ).toBe(false);

    const ok = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      cv_type: "primary",
      primary_cv_id: "11111111-1111-4111-8111-111111111111",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects overlong company, role, name, and filename", () => {
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        company: "A".repeat(APPLICATION_COMPANY_ROLE_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        first_name: "A".repeat(PROFILE_NAME_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
    expect(
      applicationCreateSchema.safeParse({
        ...VALID_BODY,
        cv_filename: "f".repeat(APPLICATION_CV_FILENAME_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
  });

  it("accepts optional enums and booleans", () => {
    const result = applicationCreateSchema.safeParse({
      ...VALID_BODY,
      slugNamePosition: "start",
      status: "draft",
      cv_type: "tailored",
      use_original_cv_filename: false,
      show_profile_picture: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("applicationUpdateSchema", () => {
  const APP_ID = "22222222-2222-4222-8222-222222222222";

  it("requires a UUID id and accepts partial fields", () => {
    expect(applicationUpdateSchema.safeParse({ company: "Acme" }).success).toBe(
      false,
    );
    const result = applicationUpdateSchema.safeParse({
      id: APP_ID,
      company: "Acme",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID id and unexpected keys", () => {
    expect(
      applicationUpdateSchema.safeParse({ id: "app-42", company: "Acme" })
        .success,
    ).toBe(false);
    const extra = applicationUpdateSchema.safeParse({
      id: APP_ID,
      user_id: "x",
    });
    expect(extra.success).toBe(false);
    if (!extra.success) {
      expect(formatApplicationUpdateZodError(extra.error)).toMatch(
        /unrecognized key/i,
      );
    }
  });

  it("validates optional slug format and primary_cv_id when cv_type is primary", () => {
    expect(
      applicationUpdateSchema.safeParse({
        id: APP_ID,
        slug: "Bad Slug",
      }).success,
    ).toBe(false);
    expect(
      applicationUpdateSchema.safeParse({
        id: APP_ID,
        cv_type: "primary",
      }).success,
    ).toBe(false);
    expect(
      applicationUpdateSchema.safeParse({
        id: APP_ID,
        cv_type: "primary",
        primary_cv_id: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true);
  });
});
