/**
 * Unit tests for createInitialProfile — idempotency, 23505 user_id vs public_id,
 * Auth metadata sync, and invalid public_id regeneration (C1-010, C1-038).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dbError,
  makeSupabaseClient,
  ok,
} from "../../helpers/supabase-mock";

const { mockCreateAdminClient, mockGetUserById, mockUpdateUserById } =
  vi.hoisted(() => ({
    mockCreateAdminClient: vi.fn(),
    mockGetUserById: vi.fn(),
    mockUpdateUserById: vi.fn(),
  }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
}));

import { createInitialProfile } from "@/lib/auth/create-initial-profile";

const INPUT = {
  userId: "user-1",
  first_name: "Jane",
  last_name: "Doe",
  public_id: "k7x2m9ab",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUserById.mockResolvedValue({
    data: {
      user: {
        id: "user-1",
        user_metadata: {
          first_name: "Jane",
          last_name: "Doe",
          public_id: "k7x2m9ab",
        },
      },
    },
    error: null,
  });
  mockUpdateUserById.mockResolvedValue({ data: { user: {} }, error: null });
});

function adminWithChains(chains: ReturnType<typeof ok>[]) {
  const client = makeSupabaseClient(chains);
  mockCreateAdminClient.mockReturnValue({
    ...client,
    auth: {
      ...client.auth,
      admin: {
        getUserById: mockGetUserById,
        updateUserById: mockUpdateUserById,
      },
    },
  });
  return client;
}

describe("createInitialProfile", () => {
  it("returns success when a profiles row already exists and Auth matches", async () => {
    adminWithChains([ok({ user_id: "user-1", public_id: "k7x2m9ab" })]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: null });
    expect(mockGetUserById).toHaveBeenCalledWith("user-1");
    expect(mockUpdateUserById).not.toHaveBeenCalled();
  });

  it("repairs Auth metadata when an existing row has a different public_id", async () => {
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          user_metadata: { public_id: "BAD-ID!" },
        },
      },
      error: null,
    });
    adminWithChains([ok({ user_id: "user-1", public_id: "k7x2m9ab" })]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: null });
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        user_metadata: expect.objectContaining({ public_id: "k7x2m9ab" }),
      }),
    );
  });

  it("inserts a profiles row and no-ops Auth sync when metadata already matches", async () => {
    const client = adminWithChains([
      ok(null),
      ok(null), // insert
    ]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: null });
    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(mockGetUserById).toHaveBeenCalled();
    expect(mockUpdateUserById).not.toHaveBeenCalled();
  });

  it("treats 23505 as success when re-select finds this user's row", async () => {
    adminWithChains([
      ok(null), // initial select
      dbError("duplicate key", "23505"), // insert
      ok({ user_id: "user-1", public_id: "k7x2m9ab" }), // re-select
    ]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: null });
    expect(mockUpdateUserById).not.toHaveBeenCalled();
  });

  it("retries with a new public_id when 23505 and this user still has no row", async () => {
    const client = adminWithChains([
      ok(null), // initial select
      dbError("duplicate key", "23505"), // insert — public_id taken
      ok(null), // re-select — not our user
      ok(null), // retry insert succeeds
    ]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: null });
    expect(client.from).toHaveBeenCalledTimes(4);
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        user_metadata: expect.objectContaining({
          public_id: expect.stringMatching(/^[a-z0-9]{8}$/),
        }),
      }),
    );
    const syncedId = mockUpdateUserById.mock.calls[0]![1].user_metadata
      .public_id as string;
    expect(syncedId).not.toBe(INPUT.public_id);
  });

  it("regenerates an invalid public_id and syncs Auth metadata", async () => {
    adminWithChains([
      ok(null),
      ok(null), // insert with regenerated id
    ]);

    const result = await createInitialProfile({
      ...INPUT,
      public_id: "BAD-ID!",
    });
    expect(result).toEqual({ error: null });
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        user_metadata: expect.objectContaining({
          public_id: expect.stringMatching(/^[a-z0-9]{6,12}$/),
        }),
      }),
    );
  });

  it("returns an error when Auth metadata sync fails after insert", async () => {
    mockUpdateUserById.mockResolvedValue({
      data: { user: null },
      error: { message: "auth unavailable" },
    });
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          user_metadata: { public_id: "stale-id" },
        },
      },
      error: null,
    });
    adminWithChains([ok(null), ok(null)]);

    const result = await createInitialProfile(INPUT);
    expect(result.error).toContain("Auth public_id sync failed");
    expect(result.error).toContain("auth unavailable");
  });

  it("returns the select error when the initial lookup fails", async () => {
    adminWithChains([dbError("connection refused")]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: "connection refused" });
  });

  it("returns non-unique insert errors", async () => {
    adminWithChains([
      ok(null),
      dbError("permission denied", "42501"),
    ]);

    const result = await createInitialProfile(INPUT);
    expect(result).toEqual({ error: "permission denied" });
  });
});
