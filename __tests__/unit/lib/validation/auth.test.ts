import { describe, expect, it } from "vitest";
import {
  AUTH_PASSWORD_MAX_BYTES,
  getSignupPasswordError,
  loginBodySchema,
  passwordUtf8ByteLength,
  SIGNUP_PASSWORD_MIN_LENGTH,
  signupBodySchema,
} from "@/lib/validation/auth";

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
});
