import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextResponse } from "next/server";

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUser: mockGetUser,
}));

import { withAuth } from "@/lib/api/with-auth";

describe("withAuth", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockGetUser.mockReset();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("returns { ok: true, user } when a session exists", async () => {
    const user = { id: "user-abc", email: "a@b.com" };
    mockGetUser.mockResolvedValue(user);

    const result = await withAuth();

    expect(result).toEqual({ ok: true, user });
  });

  it("returns 401 Unauthorized when there is no session", async () => {
    mockGetUser.mockResolvedValue(null);

    const result = await withAuth();

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected auth failure");

    expect(result.response).toBeInstanceOf(NextResponse);
    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("returns JSON 500 when getUser fails (Auth outage)", async () => {
    const cause = new Error("supabase unavailable");
    mockGetUser.mockRejectedValue(cause);

    const result = await withAuth();

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected auth failure");

    expect(errorSpy).toHaveBeenCalledWith("withAuth", cause);
    expect(result.response.status).toBe(500);
    await expect(result.response.json()).resolves.toEqual({
      error: "Internal server error",
    });
  });
});
