/**
 * Tests for /api/auth/login — validation (F1-040), session, and profile bootstrap.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GENERIC_LOGIN_ERROR } from "@/lib/validation/auth";

const {
  mockCheckRateLimit,
  mockCreateSupabaseRouteClient,
  mockSignInWithPassword,
  mockBootstrapInitialProfile,
} = vi.hoisted(() => ({
  mockCheckRateLimit: vi.fn(),
  mockCreateSupabaseRouteClient: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockBootstrapInitialProfile: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
}));

vi.mock("@/lib/supabase/route-client", () => ({
  createSupabaseRouteClient: mockCreateSupabaseRouteClient,
}));

vi.mock("@/lib/auth/bootstrap-initial-profile", () => ({
  bootstrapInitialProfile: mockBootstrapInitialProfile,
}));

import { POST } from "@/app/api/auth/login/route";

function makeRequest(body: object | string): NextRequest {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 14,
    resetAt: Date.now() + 60_000,
  });
  mockCreateSupabaseRouteClient.mockReturnValue({
    auth: { signInWithPassword: mockSignInWithPassword },
  });
  mockBootstrapInitialProfile.mockResolvedValue({ error: null });
});

describe("POST /api/auth/login", () => {
  it("returns 400 when email or password is missing", async () => {
    const response = await POST(makeRequest({ email: "", password: "" }));
    expect(response.status).toBe(400);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON (F1-040)", async () => {
    const response = await POST(makeRequest("{not-json"));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid JSON body");
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("returns 413 when the request body is too large", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: "x".repeat(10_000),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(413);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email format (F1-040)", async () => {
    const response = await POST(
      makeRequest({ email: "not-an-email", password: "secret1!" }),
    );
    expect(response.status).toBe(400);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("returns a generic 401 when credentials are invalid (F1-040)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "wrong" }),
    );
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe(GENERIC_LOGIN_ERROR);
    expect(mockBootstrapInitialProfile).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("returns 500 and logs when Auth sign-in throws (F1-040)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSignInWithPassword.mockRejectedValue(new Error("network down"));

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "secret1!" }),
    );
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Something went wrong. Please try again.");
    expect(errorSpy).toHaveBeenCalledWith(
      "[auth/login] unexpected Auth API failure:",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it("returns 500 when sign-in succeeds without a session", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" }, session: null },
      error: null,
    });

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "secret1!" }),
    );
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to create session");
    expect(mockBootstrapInitialProfile).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("bootstraps the profiles row after a successful login", async () => {
    const user = {
      id: "user-1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    };
    mockSignInWithPassword.mockResolvedValue({
      data: { user, session: { access_token: "tok", user } },
      error: null,
    });

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1!" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockBootstrapInitialProfile).toHaveBeenCalledWith(user);
  });

  it("falls back to session.user when data.user is null", async () => {
    const sessionUser = {
      id: "user-from-session",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    };
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: null,
        session: { access_token: "tok", user: sessionUser },
      },
      error: null,
    });

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1!" }),
    );
    expect(response.status).toBe(200);
    expect(mockBootstrapInitialProfile).toHaveBeenCalledWith(sessionUser);
  });

  it("skips bootstrap when the session user has no id", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: null,
        session: { access_token: "tok", user: { user_metadata: {} } },
      },
      error: null,
    });

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1!" }),
    );
    expect(response.status).toBe(200);
    expect(mockBootstrapInitialProfile).not.toHaveBeenCalled();
  });

  it("still returns success when profile bootstrap is skipped (missing names)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const user = { id: "user-1", user_metadata: { public_id: "k7x2m9ab" } };
    mockSignInWithPassword.mockResolvedValue({
      data: { user, session: { access_token: "tok", user } },
      error: null,
    });
    mockBootstrapInitialProfile.mockResolvedValue({
      error: null,
      skipped: true,
    });

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1!" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("skipped profile bootstrap"),
    );
    warnSpy.mockRestore();
  });

  it("still returns success if profile bootstrap fails", async () => {
    const user = { id: "user-1", user_metadata: {} };
    mockSignInWithPassword.mockResolvedValue({
      data: { user, session: { access_token: "tok", user } },
      error: null,
    });
    mockBootstrapInitialProfile.mockResolvedValue({ error: "db down" });

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1!" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  it("still returns success if profile bootstrap throws", async () => {
    const user = { id: "user-1", user_metadata: {} };
    mockSignInWithPassword.mockResolvedValue({
      data: { user, session: { access_token: "tok", user } },
      error: null,
    });
    mockBootstrapInitialProfile.mockRejectedValue(new Error("env missing"));

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1!" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "x" }),
    );
    expect(response.status).toBe(429);
  });
});
