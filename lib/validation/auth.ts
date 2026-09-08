import { PROFILE_NAME_MAX_LENGTH } from "@/lib/validation/profile";
import { z } from "zod";

/** Signup minimum length (F1-041). */
export const SIGNUP_PASSWORD_MIN_LENGTH = 8;

/**
 * Upper bound for passwords on login/signup, measured as UTF-8 bytes.
 * Matches bcrypt’s 72-byte truncation used by GoTrue/Supabase — counting
 * JavaScript string length would let multibyte passwords slip past.
 */
export const AUTH_PASSWORD_MAX_BYTES = 72;

/** RFC 5321 practical max for the email address. */
export const AUTH_EMAIL_MAX_LENGTH = 254;

/**
 * At least one character that is not a Unicode letter, number, or whitespace (F1-041).
 * ASCII-only `A-Za-z0-9` would treat Cyrillic/CJK letters as “special”.
 */
export const SIGNUP_PASSWORD_SPECIAL_CHAR_REGEX = /[^\p{L}\p{N}\s]/u;

/** Client-safe login failure — does not reveal whether the email exists. */
export const GENERIC_LOGIN_ERROR = "Invalid email or password";

/**
 * Client-safe signup failure — avoids confirming that an email is already
 * registered (enumeration).
 */
export const GENERIC_SIGNUP_ERROR =
  "Unable to create account. If you already have an account, try signing in.";

export const SIGNUP_PASSWORD_RULES_HINT =
  `At least ${SIGNUP_PASSWORD_MIN_LENGTH} characters (max ${AUTH_PASSWORD_MAX_BYTES} UTF-8 bytes), including one special character (not a letter, digit, or space)`;

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm password",
  first_name: "First name",
  last_name: "Last name",
};

const utf8Encoder = new TextEncoder();

/** UTF-8 byte length — the unit bcrypt/GoTrue actually truncates on. */
export function passwordUtf8ByteLength(password: string): number {
  return utf8Encoder.encode(password).length;
}

function formatAuthZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request body";

  if (issue.code === "unrecognized_keys") {
    return issue.message;
  }

  const key = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[key];
  if (!label) return issue.message;

  // Password rule / mismatch messages are already complete sentences.
  if (key === "password" || key === "confirmPassword") {
    return issue.message;
  }

  if (
    issue.message.startsWith(`${label}:`) ||
    issue.message.startsWith(label)
  ) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}

function trimmedEmailSchema() {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      return value.trim();
    },
    z
      .email({ error: "Email must be a valid email address" })
      .max(AUTH_EMAIL_MAX_LENGTH, {
        error: `Email must be at most ${AUTH_EMAIL_MAX_LENGTH} characters`,
      }),
  );
}

function requiredTrimmedName(label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      return value.trim();
    },
    z
      .string({ error: `${label} is required` })
      .min(1, { error: `${label} is required` })
      .max(PROFILE_NAME_MAX_LENGTH, {
        error: `${label} must be at most ${PROFILE_NAME_MAX_LENGTH} characters`,
      }),
  );
}

function passwordExceedsMaxBytesMessage(): string {
  return `Password must be at most ${AUTH_PASSWORD_MAX_BYTES} UTF-8 bytes`;
}

/**
 * Returns a user-facing password rule error, or null when the password is OK.
 * Shared by the signup form and Zod refine (F1-041).
 */
export function getSignupPasswordError(password: string): string | null {
  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`;
  }
  if (passwordUtf8ByteLength(password) > AUTH_PASSWORD_MAX_BYTES) {
    return passwordExceedsMaxBytesMessage();
  }
  if (!SIGNUP_PASSWORD_SPECIAL_CHAR_REGEX.test(password)) {
    return "Password must include at least one special character";
  }
  return null;
}

/** Login body: email format + length; password present with UTF-8 byte max. */
export const loginBodySchema = z
  .object({
    email: trimmedEmailSchema(),
    password: z
      .string({ error: "Password is required" })
      .min(1, { error: "Password is required" })
      .refine(
        (password) => passwordUtf8ByteLength(password) <= AUTH_PASSWORD_MAX_BYTES,
        { error: passwordExceedsMaxBytesMessage() },
      ),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;

export function formatLoginZodError(error: z.ZodError): string {
  return formatAuthZodError(error);
}

/** Signup body: names, email, matching passwords, and F1-041 strength rules. */
export const signupBodySchema = z
  .object({
    email: trimmedEmailSchema(),
    password: z.string({ error: "Password is required" }),
    confirmPassword: z.string({ error: "Confirm password is required" }),
    first_name: requiredTrimmedName("First name"),
    last_name: requiredTrimmedName("Last name"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const passwordError = getSignupPasswordError(data.password);
    if (passwordError) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: passwordError,
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type SignupBody = z.infer<typeof signupBodySchema>;

export function formatSignupZodError(error: z.ZodError): string {
  return formatAuthZodError(error);
}
