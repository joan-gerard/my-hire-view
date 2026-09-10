/**
 * Waitlist body schema — F3-064 name/email rules + F3-039 honeypot field.
 */
import { AUTH_EMAIL_MAX_LENGTH } from "@/lib/validation/auth";
import { PROFILE_NAME_MAX_LENGTH } from "@/lib/validation/profile";
import {
  formatWaitlistZodError,
  isWaitlistHoneypotTriggered,
  WAITLIST_HONEYPOT_FIELD,
  waitlistBodySchema,
} from "@/lib/validation/waitlist";
import { describe, expect, it } from "vitest";

const VALID = {
  email: "jane@example.com",
  first_name: "Jane",
  job_search_status: "Actively searching" as const,
};

describe("waitlistBodySchema", () => {
  it("accepts a minimal valid body and defaults honeypot to empty", () => {
    const parsed = waitlistBodySchema.safeParse(VALID);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.email).toBe("jane@example.com");
    expect(parsed.data.first_name).toBe("Jane");
    expect(parsed.data[WAITLIST_HONEYPOT_FIELD]).toBe("");
    expect(isWaitlistHoneypotTriggered(parsed.data)).toBe(false);
  });

  it("trims email and first_name", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      email: "  jane@example.com  ",
      first_name: "  Jane  ",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.email).toBe("jane@example.com");
    expect(parsed.data.first_name).toBe("Jane");
  });

  it("rejects invalid email format", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      email: "not-an-email",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(formatWaitlistZodError(parsed.error)).toMatch(/email/i);
  });

  it("rejects email longer than AUTH_EMAIL_MAX_LENGTH", () => {
    const local = "a".repeat(AUTH_EMAIL_MAX_LENGTH);
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      email: `${local}@x.com`,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing or blank first_name", () => {
    for (const first_name of ["", "   "]) {
      const parsed = waitlistBodySchema.safeParse({ ...VALID, first_name });
      expect(parsed.success).toBe(false);
      if (parsed.success) continue;
      expect(formatWaitlistZodError(parsed.error)).toMatch(/first name/i);
    }
  });

  it("rejects first_name longer than PROFILE_NAME_MAX_LENGTH", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      first_name: "A".repeat(PROFILE_NAME_MAX_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(formatWaitlistZodError(parsed.error)).toMatch(/at most/i);
  });

  it("rejects missing job_search_status", () => {
    const { job_search_status: _, ...rest } = VALID;
    const parsed = waitlistBodySchema.safeParse(rest);
    expect(parsed.success).toBe(false);
  });

  it("accepts optional enums and treats blank as omitted", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      primary_goal: "Get more interviews",
      career_stage: "",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.primary_goal).toBe("Get more interviews");
    expect(parsed.data.career_stage).toBeUndefined();
  });

  it("rejects invalid optional enum values", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      career_stage: "Junior",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unexpected keys", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      extra: true,
    });
    expect(parsed.success).toBe(false);
  });

  it("flags a filled honeypot", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      [WAITLIST_HONEYPOT_FIELD]: "https://spam.example",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(isWaitlistHoneypotTriggered(parsed.data)).toBe(true);
  });

  it("does not flag whitespace-only honeypot", () => {
    const parsed = waitlistBodySchema.safeParse({
      ...VALID,
      [WAITLIST_HONEYPOT_FIELD]: "   ",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(isWaitlistHoneypotTriggered(parsed.data)).toBe(false);
  });
});
