/**
 * Unit tests for profile update Zod schema (PUT /api/profile body).
 */
import { describe, it, expect } from "vitest";
import {
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
  formatProfileUpdateZodError,
  profileUpdateSchema,
} from "@/lib/validation/profile";

describe("profileUpdateSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts null and http(s) URLs", () => {
    const result = profileUpdateSchema.safeParse({
      first_name: "Jane",
      location: null,
      portfolio_url: "https://example.com",
      linkedin_url: null,
      profile_picture_url: "https://cdn.example.com/pic.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("coerces blank URL strings to null", () => {
    const result = profileUpdateSchema.safeParse({ portfolio_url: "  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.portfolio_url).toBeNull();
    }
  });

  it("rejects unexpected keys", () => {
    const result = profileUpdateSchema.safeParse({ user_id: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatProfileUpdateZodError(result.error)).toMatch(
        /unrecognized key/i,
      );
    }
  });

  it("rejects overlong names and locations", () => {
    expect(
      profileUpdateSchema.safeParse({
        first_name: "A".repeat(PROFILE_NAME_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
    expect(
      profileUpdateSchema.safeParse({
        location: "L".repeat(PROFILE_LOCATION_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
  });

  it("rejects overlong URLs and non-http(s) protocols", () => {
    expect(
      profileUpdateSchema.safeParse({
        portfolio_url: `https://example.com/${"x".repeat(PROFILE_URL_MAX_LENGTH)}`,
      }).success,
    ).toBe(false);
    expect(
      profileUpdateSchema.safeParse({ linkedin_url: "ftp://example.com" })
        .success,
    ).toBe(false);
  });
});
