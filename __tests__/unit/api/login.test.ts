/**
 * Tests for /api/auth/login — credentials, session, and profile bootstrap (C1-009).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

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

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
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

  it("returns 401 when credentials are invalid", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "wrong" }),
    );
    expect(response.status).toBe(401);
    expect(mockBootstrapInitialProfile).not.toHaveBeenCalled();
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
      makeRequest({ email: "jane@example.com", password: "secret1" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mockBootstrapInitialProfile).toHaveBeenCalledWith(user);
  });

  it("still returns success if profile bootstrap fails", async () => {
    const user = { id: "user-1", user_metadata: {} };
    mockSignInWithPassword.mockResolvedValue({
      data: { user, session: { access_token: "tok", user } },
      error: null,
    });
    mockBootstrapInitialProfile.mockResolvedValue({ error: "db down" });

    const response = await POST(
      makeRequest({ email: "jane@example.com", password: "secret1" }),
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
