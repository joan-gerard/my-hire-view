import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUser: mockGetUser,
}));

import { withAuth } from "@/lib/api/with-auth";

describe("withAuth", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
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

  it("propagates getUser failures so callers can map them to 500", async () => {
    mockGetUser.mockRejectedValue(new Error("supabase unavailable"));

    await expect(withAuth()).rejects.toThrow("supabase unavailable");
  });
});
