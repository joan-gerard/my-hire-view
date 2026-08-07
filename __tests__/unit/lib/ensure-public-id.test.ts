/**
 * Unit tests for ensureProfilePublicId / resolvePublicIdReadOnly validation
 * and repair of invalid stored public ids.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dbError,
  makeSupabaseClient,
  ok,
} from "../../helpers/supabase-mock";
import {
  ensureProfilePublicId,
  resolvePublicIdReadOnly,
} from "@/lib/auth/ensure-public-id";

describe("resolvePublicIdReadOnly", () => {
  it("returns a valid profiles.public_id", async () => {
    const client = makeSupabaseClient([ok({ public_id: "k7x2m9ab" })]);
    const id = await resolvePublicIdReadOnly(client as never, { id: "u1" });
    expect(id).toBe("k7x2m9ab");
  });

  it("returns null when a profiles row exists with an invalid public_id (no Auth fallback)", async () => {
    const client = makeSupabaseClient([ok({ public_id: "BAD!" })]);
    const id = await resolvePublicIdReadOnly(client as never, {
      id: "u1",
      user_metadata: { public_id: "k7x2m9ab" },
    });
    expect(id).toBeNull();
  });

  it("falls back to Auth metadata only when no profiles row exists", async () => {
    const client = makeSupabaseClient([ok(null)]);
    const id = await resolvePublicIdReadOnly(client as never, {
      id: "u1",
      user_metadata: { public_id: "k7x2m9ab" },
    });
    expect(id).toBe("k7x2m9ab");
  });

  it("returns null when both profile and metadata are invalid/missing", async () => {
    const client = makeSupabaseClient([ok({ public_id: "BAD!" })]);
    const id = await resolvePublicIdReadOnly(client as never, {
      id: "u1",
      user_metadata: { public_id: "also-bad" },
    });
    expect(id).toBeNull();
  });
});

describe("ensureProfilePublicId", () => {
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null });
  });

  function clientWithAuth(chains: ReturnType<typeof ok>[]) {
    const base = makeSupabaseClient(chains);
    return {
      ...base,
      auth: {
        ...base.auth,
        updateUser: mockUpdateUser,
      },
    };
  }

  it("returns a valid existing public_id and syncs Auth when metadata differs", async () => {
    const client = clientWithAuth([ok({ public_id: "k7x2m9ab" })]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: { public_id: "otherid1" },
    });

    expect(id).toBe("k7x2m9ab");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: "k7x2m9ab" },
    });
  });

  it("does not sync Auth when metadata already matches a valid profile id", async () => {
    const client = clientWithAuth([ok({ public_id: "k7x2m9ab" })]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: { public_id: "k7x2m9ab" },
    });

    expect(id).toBe("k7x2m9ab");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("repairs an invalid existing public_id and syncs Auth to the repaired id", async () => {
    const client = clientWithAuth([
      ok({ public_id: "BAD!" }),
      ok(null), // preferred id ownership check — available
      ok({ public_id: "fixed001" }), // conditional update
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "staleid1",
      },
    });

    expect(id).toBe("fixed001");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: "fixed001" },
    });
    expect(mockUpdateUser).not.toHaveBeenCalledWith({
      data: { public_id: "BAD!" },
    });
  });

  it("retries repair with a new id when the preferred public_id collides (23505)", async () => {
    const client = clientWithAuth([
      ok({ public_id: "BAD!" }),
      ok(null), // ownership check for preferred
      dbError("duplicate key", "23505"), // first repair update
      ok({ public_id: "retryid1" }), // second update succeeds
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "taken001",
      },
    });

    expect(id).toBe("retryid1");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: "retryid1" },
    });
  });

  it("throws when repair exhausts unique-id retries", async () => {
    const client = clientWithAuth([
      ok({ public_id: "BAD!" }),
      ok(null), // ownership
      dbError("duplicate key", "23505"),
      dbError("duplicate key", "23505"),
      dbError("duplicate key", "23505"),
    ]);

    await expect(
      ensureProfilePublicId(client as never, {
        id: "u1",
        user_metadata: {
          first_name: "Jane",
          last_name: "Doe",
          public_id: "taken001",
        },
      }),
    ).rejects.toThrow(/could not assign a unique/i);
  });

  it("creates a profiles row when none exists", async () => {
    const client = clientWithAuth([
      ok(null), // no existing row
      ok(null), // ownership check for preferred
      ok(null), // insert
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "k7x2m9ab",
      },
    });

    expect(id).toBe("k7x2m9ab");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("generates a public_id when creating and metadata has none", async () => {
    const client = clientWithAuth([
      ok(null), // no existing
      ok(null), // insert
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
      },
    });

    expect(id).toMatch(/^[a-z0-9]{8}$/);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: id },
    });
  });

  it("rejects a preferred metadata id owned by another user when creating", async () => {
    const client = clientWithAuth([
      ok(null), // no existing row
      ok({ user_id: "other-user" }), // ownership — taken
      ok(null), // insert with generated id
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "taken001",
      },
    });

    expect(id).toMatch(/^[a-z0-9]{8}$/);
    expect(id).not.toBe("taken001");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: id },
    });
  });

  it("retries create insert when public_id collides repeatedly then succeeds", async () => {
    const client = clientWithAuth([
      ok(null), // no existing
      ok(null), // ownership for preferred
      dbError("duplicate key", "23505"),
      ok(null), // re-read — no row yet (public_id taken by someone else)
      dbError("duplicate key", "23505"),
      ok(null), // re-read — still none
      ok(null), // third insert succeeds
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "taken001",
      },
    });

    expect(id).toMatch(/^[a-z0-9]{8}$/);
    expect(id).not.toBe("taken001");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: id },
    });
  });

  it("keeps the concurrent create winner on user_id conflict instead of overwriting", async () => {
    const client = clientWithAuth([
      ok(null), // no existing
      ok(null), // ownership
      dbError("duplicate key", "23505"), // insert lost the race
      ok({ public_id: "winner01" }), // re-read canonical
    ]);

    const id = await ensureProfilePublicId(client as never, {
      id: "u1",
      user_metadata: {
        first_name: "Jane",
        last_name: "Doe",
        public_id: "loser001",
      },
    });

    expect(id).toBe("winner01");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { public_id: "winner01" },
    });
  });

  it("throws when create insert exhausts unique-id retries", async () => {
    const client = clientWithAuth([
      ok(null),
      ok(null), // ownership
      dbError("duplicate key", "23505"),
      ok(null), // re-read empty
      dbError("duplicate key", "23505"),
      ok(null),
      dbError("duplicate key", "23505"),
      ok(null),
    ]);

    await expect(
      ensureProfilePublicId(client as never, {
        id: "u1",
        user_metadata: {
          first_name: "Jane",
          last_name: "Doe",
          public_id: "taken001",
        },
      }),
    ).rejects.toThrow(/could not assign a unique/i);
  });
});
