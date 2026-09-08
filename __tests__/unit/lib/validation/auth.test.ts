import { describe, expect, it, vi } from "vitest";
import {
  AUTH_PASSWORD_MAX_BYTES,
  getSignupPasswordError,
  loginBodySchema,
  passwordExceedsMaxBytes,
  passwordUtf8ByteLength,
  SIGNUP_PASSWORD_MIN_LENGTH,
  signupBodySchema,
} from "@/lib/validation/auth";

describe("passwordExceedsMaxBytes", () => {
  it("short-circuits on JS length without needing a full UTF-8 encode path for huge input", () => {
    const huge = "a".repeat(AUTH_PASSWORD_MAX_BYTES + 1);
    expect(passwordExceedsMaxBytes(huge)).toBe(true);
  });

  it("detects multibyte passwords over the byte cap under the length cap", () => {
    const multibyte = "é".repeat(40);
    expect(multibyte.length).toBeLessThanOrEqual(AUTH_PASSWORD_MAX_BYTES);
    expect(passwordUtf8ByteLength(multibyte)).toBeGreaterThan(
      AUTH_PASSWORD_MAX_BYTES,
    );
    expect(passwordExceedsMaxBytes(multibyte)).toBe(true);
  });
});

describe("getSignupPasswordError", () => {
  it("rejects passwords shorter than the minimum", () => {
    expect(getSignupPasswordError("Ab1!")).toContain(
      `at least ${SIGNUP_PASSWORD_MIN_LENGTH}`,
    );
  });

  it("rejects passwords without a special character", () => {
    expect(getSignupPasswordError("password1")).toContain("special character");
  });

  it("rejects Unicode letter+digit passwords that lack a real special character", () => {
    expect(getSignupPasswordError("пароль123")).toContain("special character");
  });

  it("rejects whitespace-only passwords that lack a real special character", () => {
    expect(getSignupPasswordError("        ")).toContain("special character");
  });

  it("rejects passwords that use only spaces as the non-alphanumeric char", () => {
    expect(getSignupPasswordError("pass word")).toContain("special character");
  });

  it("rejects passwords longer than the max UTF-8 byte length", () => {
    const long = `${"a".repeat(AUTH_PASSWORD_MAX_BYTES)}!`;
    expect(getSignupPasswordError(long)).toBe(
      `Password must be at most ${AUTH_PASSWORD_MAX_BYTES} UTF-8 bytes`,
    );
  });

  it("rejects multibyte passwords that exceed 72 UTF-8 bytes under 72 characters", () => {
    // "é" is 2 UTF-8 bytes; 40 × é = 80 bytes, 40 JS string units.
    const multibyte = `${"é".repeat(40)}!`;
    expect(multibyte.length).toBeLessThanOrEqual(AUTH_PASSWORD_MAX_BYTES);
    expect(passwordUtf8ByteLength(multibyte)).toBeGreaterThan(
      AUTH_PASSWORD_MAX_BYTES,
    );
    expect(getSignupPasswordError(multibyte)).toBe(
      `Password must be at most ${AUTH_PASSWORD_MAX_BYTES} UTF-8 bytes`,
    );
  });

  it("accepts a strong enough password", () => {
    expect(getSignupPasswordError("secret1!")).toBeNull();
  });

  it("accepts Unicode letters when a real special character is present", () => {
    expect(getSignupPasswordError("пароль12!")).toBeNull();
  });
});

describe("loginBodySchema", () => {
  it("trims email and accepts valid credentials", () => {
    const parsed = loginBodySchema.safeParse({
      email: "  jane@example.com ",
      password: "any",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("jane@example.com");
    }
  });

  it("rejects invalid email", () => {
    const parsed = loginBodySchema.safeParse({
      email: "nope",
      password: "any",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects passwords over the UTF-8 byte max", () => {
    const parsed = loginBodySchema.safeParse({
      email: "jane@example.com",
      password: "é".repeat(40),
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects oversized JS-length passwords without treating them as valid", () => {
    const parsed = loginBodySchema.safeParse({
      email: "jane@example.com",
      password: "a".repeat(AUTH_PASSWORD_MAX_BYTES + 10),
    });
    expect(parsed.success).toBe(false);
  });
});

describe("signupBodySchema", () => {
  const base = {
    email: "jane@example.com",
    password: "secret1!",
    confirmPassword: "secret1!",
    first_name: "Jane",
    last_name: "Doe",
  };

  it("accepts a valid signup body", () => {
    expect(signupBodySchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const parsed = signupBodySchema.safeParse({
      ...base,
      confirmPassword: "other1!",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    const parsed = signupBodySchema.safeParse({
      ...base,
      password: "short",
      confirmPassword: "short",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects all-space passwords", () => {
    const spaces = "        ";
    const parsed = signupBodySchema.safeParse({
      ...base,
      password: spaces,
      confirmPassword: spaces,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects huge password strings via the length cap", () => {
    const encodeSpy = vi.spyOn(TextEncoder.prototype, "encode");
    const huge = "a".repeat(10_000);
    const parsed = signupBodySchema.safeParse({
      ...base,
      password: huge,
      confirmPassword: huge,
    });
    expect(parsed.success).toBe(false);
    // Zod .max should reject before getSignupPasswordError encodes the huge string.
    expect(
      encodeSpy.mock.calls.some(
        (call) => typeof call[0] === "string" && call[0].length === 10_000,
      ),
    ).toBe(false);
    encodeSpy.mockRestore();
  });

  it("uses a confirm-specific message when only confirmPassword is oversized", () => {
    const parsed = signupBodySchema.safeParse({
      ...base,
      confirmPassword: "a".repeat(AUTH_PASSWORD_MAX_BYTES + 1),
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(
        `Confirm password must be at most ${AUTH_PASSWORD_MAX_BYTES} UTF-8 bytes`,
      );
    }
  });
});
