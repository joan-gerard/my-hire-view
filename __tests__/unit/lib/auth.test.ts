import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthApiError, AuthSessionMissingError } from "@supabase/supabase-js";

const { mockGetUser, mockCreateClient } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

import { getUser } from "@/lib/auth";

describe("getUser", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
    });
  });

  it("returns the user when Auth succeeds", async () => {
    const user = { id: "user-1" };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });

    await expect(getUser()).resolves.toEqual(user);
  });

  it("returns null when the session is missing", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new AuthSessionMissingError(),
    });

    await expect(getUser()).resolves.toBeNull();
  });

  it("throws non-session Auth errors so callers do not treat outages as signed out", async () => {
    const error = new AuthApiError("Auth service down", 503, "unexpected_failure");
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error,
    });

    await expect(getUser()).rejects.toBe(error);
  });
});
