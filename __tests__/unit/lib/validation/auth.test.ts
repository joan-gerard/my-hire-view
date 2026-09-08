import { describe, expect, it } from "vitest";
import {
  AUTH_PASSWORD_MAX_LENGTH,
  getSignupPasswordError,
  loginBodySchema,
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

  it("rejects passwords longer than the max", () => {
    const long = `${"a".repeat(AUTH_PASSWORD_MAX_LENGTH)}!`;
    expect(getSignupPasswordError(long)).toContain(
      `at most ${AUTH_PASSWORD_MAX_LENGTH}`,
    );
  });

  it("accepts a strong enough password", () => {
    expect(getSignupPasswordError("secret1!")).toBeNull();
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
});
