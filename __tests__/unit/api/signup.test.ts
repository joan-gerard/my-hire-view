/**
 * Tests for /api/auth/signup — required names, password confirmation, and
 * profile creation when a session is issued immediately.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockCheckRateLimit, mockCreateSupabaseRouteClient, mockSignUp, mockFrom } =
  vi.hoisted(() => {
    const mockSignUp = vi.fn();
    const mockFrom = vi.fn();
    return {
      mockCheckRateLimit: vi.fn(),
      mockCreateSupabaseRouteClient: vi.fn(),
      mockSignUp,
      mockFrom,
    };
  });

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  rateLimit429: vi.fn().mockReturnValue(
    new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
    }),
  ),
}));

vi.mock("@/lib/supabase/route-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase/route-client")>();
  return {
    ...actual,
    createSupabaseRouteClient: mockCreateSupabaseRouteClient,
  };
});

import { POST } from "@/app/api/auth/signup/route";

const VALID_BODY = {
  email: "jane@example.com",
  password: "secret1",
  confirmPassword: "secret1",
  first_name: "Jane",
  last_name: "Doe",
};

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function mockUpsertOk() {
  mockFrom.mockReturnValue({
    upsert: vi.fn().mockResolvedValue({ error: null }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockReturnValue({
    success: true,
    remaining: 4,
    resetAt: Date.now() + 60_000,
  });
  mockCreateSupabaseRouteClient.mockReturnValue({
    auth: { signUp: mockSignUp },
    from: mockFrom,
  });
  mockUpsertOk();
});

describe("POST /api/auth/signup", () => {
  it("returns 400 when email or password is missing", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, email: "", password: "" }),
    );
    expect(response.status).toBe(400);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns 400 when first or last name is missing", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, first_name: "  ", last_name: "" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("First name and last name");
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns 400 when passwords do not match", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, confirmPassword: "other" }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Passwords do not match");
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns 400 when password is too short", async () => {
    const response = await POST(
      makeRequest({
        ...VALID_BODY,
        password: "abc",
        confirmPassword: "abc",
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("at least 6");
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns requiresConfirmation when signUp has no session", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: null },
      error: null,
    });

    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ success: true, requiresConfirmation: true });
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "jane@example.com",
        password: "secret1",
        options: expect.objectContaining({
          data: { first_name: "Jane", last_name: "Doe" },
        }),
      }),
    );
  });

  it("preserves cookies set during signUp when confirmation is required", async () => {
    mockCreateSupabaseRouteClient.mockImplementation(
      ({ response }: { response: { cookies: { set: (n: string, v: string) => void } } }) => {
        response.cookies.set("sb-test-code-verifier", "pkce-secret");
        return {
          auth: { signUp: mockSignUp },
          from: mockFrom,
        };
      },
    );
    mockSignUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: null },
      error: null,
    });

    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(200);
    expect(response.cookies.get("sb-test-code-verifier")?.value).toBe(
      "pkce-secret",
    );
  });

  it("creates a profile when a session is issued immediately", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-1" },
        session: { access_token: "tok" },
      },
      error: null,
    });

    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ success: true, requiresConfirmation: false });
    expect(mockFrom).toHaveBeenCalledWith("profiles");
  });

  it("returns 400 when Supabase signUp fails", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });

    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("User already registered");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(429);
  });
});
